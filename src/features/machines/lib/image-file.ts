const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
// Acima disso nem tenta processar — foto de celular moderna passa fácil de 10-20MB em RAW/HEIC
// convertido, e não há necessidade de carregar isso na memória só pra reduzir depois.
const MAX_SOURCE_FILE_SIZE = 20 * 1024 * 1024;

// Converte o arquivo escolhido no seletor nativo em um data URL já redimensionado — sem isso, uma
// foto de celular direto da câmera (vários MB) viraria uma string enorme guardada em
// MachineImage.url (Context.md: sem provedor de storage configurado neste projeto, então a imagem
// em si mora no banco). 1600px no maior lado e JPEG a 82% já bastam pra exibição no catálogo e no
// detalhe, e mantêm o payload da requisição bem abaixo de qualquer limite de corpo de requisição.
export async function resizeImageToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem (JPG, PNG ou WEBP).");
  }
  if (file.size > MAX_SOURCE_FILE_SIZE) {
    throw new Error("Essa imagem é muito grande. Escolha um arquivo de até 20 MB.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Não foi possível processar a imagem neste navegador.");
    }
    context.drawImage(bitmap, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}
