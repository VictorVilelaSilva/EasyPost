import json
from typing import List

from google import genai
from google.genai import types

from app.core.config import get_settings
from app.schemas.carousel import CarouselResponse

class GenAIService:
    def __init__(self):
        settings = get_settings()
        # Initialize the GenAI client with the API key
        self.client = genai.Client(api_key=settings.GOOGLE_GENERATIVE_AI_API_KEY)

    async def generate_topics(self, niche: str) -> List[str]:
        prompt = f"""Você é um estrategista de conteúdo expert em Instagram. O usuário vai fornecer um nicho de conteúdo. Seu trabalho é gerar exatamente 15 temas de posts de carrossel para Instagram altamente envolventes, em alta e compartilháveis para esse nicho.

      Os temas DEVEM ser escritos em Português do Brasil.
      Os temas devem ser chamativos, específicos e acionáveis.
      Exemplos de formato: "5 Ganchos para Prender a Atenção", "O Segredo por Trás de [X]", "Pare de Fazer Isso no [X]".

      Nicho: "{niche}\""""

        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "topics": {
                            "type": "ARRAY",
                            "description": "Exatamente 15 temas de carrossel",
                            "items": {"type": "STRING"}
                        }
                    },
                    "required": ["topics"]
                }
            )
        )
        
        if not response.text:
            raise ValueError("Resposta vazia do Gemini")
            
        data = json.loads(response.text)
        return data.get("topics", [])

    async def generate_carousel(self, topic: str, niche: str) -> CarouselResponse:
        prompt = f"""Você é um estrategista de conteúdo e copywriter expert em Instagram para o mercado brasileiro.
            Tópico: "{topic}"
            Nicho: "{niche}"

            Objetivo: Criar o roteiro de um carrossel de 5 slides para Instagram no estilo educativo/informativo brasileiro.

            IMPORTANTE: Todo o conteúdo DEVE ser escrito em Português do Brasil.

            ESTRUTURA OBRIGATÓRIA DOS SLIDES:

            Slide 1 — CAPA (Gancho que para o scroll):
            - slideType: "cover"
            - title: Uma pergunta provocativa ou afirmação impactante que gere curiosidade (máx 50 chars). Exemplo: "ISSO VALE A PENA?", "PARE DE FAZER ISSO"
            - content: Um subtítulo curto complementando o gancho (máx 60 chars)

            Slides 2 e 3 — CONTEÚDO (Valor educativo):
            - slideType: "content"
            - title: Um subtítulo curto do bloco de conteúdo (máx 40 chars)
            - content: Texto educativo mais longo explicando o ponto, como se fosse um parágrafo de um post informativo. Pode ter de 150 a 300 caracteres. Use linguagem direta, conversacional, em caixa alta seria ideal.

            Slide 4 — CONTEÚDO FINAL (Conclusão/Insight):
            - slideType: "content"
            - title: Conclusão ou insight final (máx 40 chars)
            - content: Texto de 150-300 chars com o argumento final, conselho prático ou dado que fecha o raciocínio.

            Slide 5 — CTA (Chamada para Ação):
            - slideType: "cta"
            - title: "GOSTOU DO CONTEÚDO?" ou variação
            - content: "❤️ CURTA | 💬 COMENTE | ✈️ COMPARTILHE | 📌 SALVE"

            Para a 'caption', escreva uma legenda envolvente para Instagram incluindo emojis e exatamente 7 hashtags relevantes em português."""

        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "slides": {
                            "type": "ARRAY",
                            "description": "Exatamente 5 slides",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "slideType": {"type": "STRING", "description": "Tipo do slide: cover, content, ou cta"},
                                    "title": {"type": "STRING", "description": "Título do slide"},
                                    "content": {"type": "STRING", "description": "Texto principal do slide"}
                                },
                                "required": ["slideType", "title", "content"]
                            }
                        },
                        "caption": {
                            "type": "STRING",
                            "description": "Legenda do Instagram com hashtags"
                        }
                    },
                    "required": ["slides", "caption"]
                }
            )
        )
        
        if not response.text:
            raise ValueError("Resposta vazia do Gemini")
            
        data = json.loads(response.text)
        return CarouselResponse(**data)

    async def generate_slide_image(self, prompt: str) -> bytes:
        response = self.client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                aspect_ratio="1:1"
            )
        )
        
        # In the python SDK, the image data comes back as bytes in inline_data.data if present
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.inline_data and part.inline_data.data:
                    return part.inline_data.data
                    
        raise ValueError("Nenhuma imagem retornada pela API do Google")

genai_service = GenAIService()
