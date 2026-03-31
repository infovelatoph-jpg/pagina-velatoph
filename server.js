require('dotenv').config();
const path = require('path');
const express = require('express');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;
const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
const client = hasApiKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.use(express.json());
app.use(express.static(__dirname));

const systemPrompt = `Eres el asistente web de Velatoph, empresa enfocada en protección sísmica. Responde en español claro, breve y útil. No prometas resultados absolutos ni invulnerabilidad. Explica de forma comercial-técnica conceptos como aislamiento sísmico, disipación de energía, análisis estructural, evaluación preliminar y aplicaciones por tipo de proyecto. Si falta información del proyecto, pide datos clave como tipo de inmueble, etapa, ubicación, uso e importancia operativa. Si la pregunta requiere ingeniería formal, aclara que se necesita evaluación técnica especializada.`;

app.post('/api/chat', async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) {
      return res.status(400).json({ error: 'Mensaje vacío.' });
    }

    if (!client) {
      return res.json({
        reply: 'El chat ya está preparado para IA real, pero todavía falta configurar la API key en el servidor. Mientras tanto, puedes escribir a WhatsApp al +52 312 189 2161 o solicitar una evaluación técnica.'
      });
    }

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || 'No pude generar una respuesta en este momento.';
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Ocurrió un problema al consultar el asistente.'
    });
  }
});

app.listen(port, () => {
  console.log(`Velatoph site running on http://localhost:${port}`);
});
