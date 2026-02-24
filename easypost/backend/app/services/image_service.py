import base64
import io
import asyncio
from typing import List

from PIL import Image

from app.schemas.carousel import ImagesRequest, SlideData
from app.services.genai_service import genai_service

STYLE_MAP = {
    "minimalist": "Ultra-clean minimalist design. White space, thin lines, simple geometric shapes. Flat colors, no textures.",
    "luxury": "Luxurious, premium aesthetic. Rich deep colors, gold or silver accents, elegant sophisticated feel. Subtle leather or marble textures.",
    "corporate": "Professional corporate design. Clean structured layout, trustworthy blue tones, sharp edges. Business-oriented, polished.",
    "clean-tech": "Modern tech aesthetic. Sleek gradients, subtle glassmorphism, futuristic feel. Neon accents on dark background.",
    "creative": "Bold creative design. Vibrant colors, artistic flair, dynamic compositions. Hand-drawn elements or paint strokes mixed with typography.",
    "neon": "Neon glow aesthetic. Dark black background with vivid neon lights (pink, cyan, purple). Cyberpunk-inspired glow effects around text.",
}

PALETTE_MAP = {
    "dark": "Dark gradient background (deep navy #0f172a to black #000). White and light gray text for contrast.",
    "light": "Clean light/white background (#f8fafc). Dark navy text (#1e293b). Subtle soft shadows.",
    "blue": "Rich blue palette. Deep navy background (#1e3a5f) with electric blue accents (#2563eb, #60a5fa). White text.",
    "green": "Nature-inspired green palette. Dark emerald (#064e3b) background, mint and teal accents (#059669, #34d399). White text.",
    "warm": "Warm sunset palette. Deep orange-brown (#7c2d12) background, vibrant orange accents (#ea580c, #fb923c). Cream text.",
    "purple": "Royal purple palette. Deep violet (#3b0764) background, lavender accents (#7c3aed, #a78bfa). White text.",
}

class ImageService:
    def build_prompt(
        self,
        slide: SlideData,
        index: int,
        total_slides: int,
        style_desc: str,
        palette_desc: str,
        brand_desc: str,
        audience_desc: str,
        custom_desc: str,
        has_logo: bool
    ) -> str:
        slide_type = slide.slide_type
        
        logo_instruction = "- Canto inferior esquerdo: DEIXE UMA ÁREA LIVRE (sem texto, sem ícone) para inserção posterior de logo." if has_logo else ""

        if slide_type == 'cover':
            return f"""Gere um gráfico de CAPA de carrossel para Instagram (1:1 quadrado, 1080x1080px).

            ESTILO DE REFERÊNCIA: Post educativo brasileiro profissional.
            {'ESTILO ADICIONAL: ' + style_desc if style_desc else ''}
            {brand_desc or ('PALETA: ' + palette_desc if palette_desc else '')}
            {audience_desc}
            {custom_desc}

            LAYOUT DA CAPA:
            - Fundo claro/branco clean com textura sutil de papel.
            - Um elemento visual decorativo relacionado ao tema no canto inferior direito (ex: produto, ilustração 3D, objeto temático).
            - Uma faixa/badge retangular arredondada em azul marinho escuro (#1a2744) no centro-esquerda da imagem.
            - DENTRO do badge: O título principal em BRANCO, fonte serif bold, CAIXA ALTA.
            - Abaixo do badge: O subtítulo em azul marinho escuro, fonte serif, CAIXA ALTA.
            {logo_instruction}

            TEXTO A RENDERIZAR (EXATAMENTE, sem inventar):
            - TÍTULO (dentro do badge): "{slide.title}"
            - SUBTÍTULO (abaixo do badge): "{slide.content}"

            REGRAS:
            - Tipografia serif elegante (estilo editorial).
            - NÃO adicione texto inventado, gibberish ou nomes de pessoas.
            - O texto DEVE estar em Português do Brasil.
            - Este é um gráfico de mídia social profissional."""

        if slide_type == 'cta':
            return f"""Gere um gráfico de CTA (Call to Action) de carrossel para Instagram (1:1 quadrado, 1080x1080px).

            ESTILO DE REFERÊNCIA: Post educativo brasileiro profissional.
            {'ESTILO ADICIONAL: ' + style_desc if style_desc else ''}
            {brand_desc or ('PALETA: ' + palette_desc if palette_desc else '')}
            {audience_desc}
            {custom_desc}

            LAYOUT DO CTA:
            - Fundo claro/branco clean.
            - No centro-esquerda: Uma faixa/badge retangular arredondada em azul marinho escuro (#1a2744).
            - DENTRO do badge: "{slide.title}" em BRANCO, fonte serif bold, CAIXA ALTA.
            - Abaixo do badge, listar verticalmente com ícones:
            ❤️ CURTA
            💬 COMENTE
            ✈️ COMPARTILHE
            - Cada item com o ícone correspondente ao lado, texto em azul marinho, fonte serif, CAIXA ALTA.
            {logo_instruction}

            REGRAS:
            - Tipografia serif elegante.
            - NÃO invente texto ou nomes de pessoas. NÃO coloque foto de pessoa.
            - O texto DEVE estar em Português do Brasil."""

        # Content slides ('content')
        return f"""Gere um gráfico de slide de CONTEÚDO de carrossel para Instagram (1:1 quadrado, 1080x1080px).

            ESTILO DE REFERÊNCIA: Post educativo brasileiro profissional.
            {'ESTILO ADICIONAL: ' + style_desc if style_desc else ''}
            {brand_desc or ('PALETA: ' + palette_desc if palette_desc else '')}
            {audience_desc}
            {custom_desc}

            LAYOUT DO CONTEÚDO:
            - Fundo azul marinho escuro sólido (#1a2744) ou gradiente escuro elegante.
            - Um ícone de "deslizar" (mão apontando para direita) no canto superior direito em branco.
            - O texto principal em BRANCO, fonte serif, CAIXA ALTA, ocupando a maior parte da imagem.
            - O texto deve ser grande, legível, e preencher bem o espaço.
            {logo_instruction}

            TEXTO A RENDERIZAR (EXATAMENTE, sem inventar):
            - CORPO DO TEXTO: "{slide.content}"

            REGRAS:
            - Tipografia serif elegante (tipo editorial/revista).
            - Texto grande, ocupando 60-70% da área da imagem.
            - NÃO adicione texto inventado ou gibberish.
            - NÃO coloque foto de pessoa.
            - O texto DEVE estar em Português do Brasil."""

    async def overlay_logo_sync(self, image_bytes: bytes, logo_data_url: str) -> bytes:
        # Run pillow processing in a sync method - we'll call it with asyncio.to_thread
        # Decode base64 image
        main_img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
        
        # Decode logo
        logo_base64 = logo_data_url.split(",")[1]
        logo_bytes = base64.b64decode(logo_base64)
        logo_img = Image.open(io.BytesIO(logo_bytes)).convert("RGBA")
        
        # Calculate aspect ratio preserving resize inside 80x80 box
        target_size = 80
        logo_img.thumbnail((target_size, target_size), Image.Resampling.LANCZOS)
        
        margin = 50
        image_size = 1080  # Generated images are 1080x1080
        
        # Paste logo onto main image using alpha channel as mask
        paste_x = margin
        paste_y = image_size - logo_img.height - margin
        
        main_img.alpha_composite(logo_img, dest=(paste_x, paste_y))
        
        # Convert back to bytes
        # We need RGB for jpeg/png without alpha (if not needed), but let's stick to PNG
        out_bytes = io.BytesIO()
        main_img.save(out_bytes, format="PNG")
        return out_bytes.getvalue()

    async def generate_images(self, request: ImagesRequest) -> List[str]:
        style_desc = STYLE_MAP.get(request.visual_style, "")
        palette_desc = PALETTE_MAP.get(request.color_palette, "")
        
        brand_colors = request.brand_colors.colors
        brand_desc = ""
        if brand_colors:
            colors_str = ", ".join(brand_colors)
            brand_desc = f"CORES DA MARCA (USE OBRIGATORIAMENTE): As cores da identidade visual da marca são: {colors_str}. Use a primeira cor como cor principal (backgrounds e badges), a segunda como cor de texto/contraste, e as demais como acentos. Toda a identidade visual do slide deve seguir essa paleta."
            
        audience = request.audience
        audience_desc = ""
        if audience.age or audience.interests:
            parts = []
            if audience.age:
                parts.append(f"Idade {audience.age}")
            if audience.interests:
                parts.append(f"interessado em {audience.interests}")
            audience_desc = f"Público-Alvo: {', '.join(parts)}. O design deve ressoar com esse público."
            
        custom_desc = ""
        if request.custom_prompt:
            custom_desc = f"Instruções Adicionais: {request.custom_prompt}"

        has_logo = bool(request.brand_colors.logo_data_url)

        async def generate_single_slide(slide: SlideData, index: int) -> str:
            prompt = self.build_prompt(
                slide=slide,
                index=index,
                total_slides=len(request.slides),
                style_desc=style_desc,
                palette_desc=palette_desc,
                brand_desc=brand_desc,
                audience_desc=audience_desc,
                custom_desc=custom_desc,
                has_logo=has_logo
            )
            
            # Call generation wrapper
            image_bytes = await genai_service.generate_slide_image(prompt)
            
            # Overlay logo if present
            if has_logo:
                image_bytes = await asyncio.to_thread(
                    self.overlay_logo_sync, 
                    image_bytes, 
                    request.brand_colors.logo_data_url
                )
                
            base64_img = base64.b64encode(image_bytes).decode('utf-8')
            return f"data:image/png;base64,{base64_img}"

        # Generate all images in parallel
        tasks = [generate_single_slide(slide, i) for i, slide in enumerate(request.slides)]
        generated_images = await asyncio.gather(*tasks)
        
        return list(generated_images)

image_service = ImageService()
