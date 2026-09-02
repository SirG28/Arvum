// A maior exibição real dessa imagem é a galeria do anúncio (MachineGallery.tsx), dentro do
// container `max-w-5xl` da página — na prática nunca passa de ~630px de largura em CSS mesmo em
// desktop (a maior parte do espaço divide com a lateral de reserva), o que dá uns 1260px físicos
// numa tela retina de 2x. 1280px no maior lado já cobre isso com folga; qualquer coisa maior só
// infla o data URL guardado em MachineImage.url (sem provedor de storage — Context.md) sem ganho
// visível, e cada máquina no catálogo carrega essa string inteira embutida no HTML da página.
const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.75;
// Acima disso nem tenta processar — foto de celular moderna passa fácil de 10-20MB em RAW/HEIC
// convertido, e não há necessidade de carregar isso na memória só pra reduzir depois.
const MAX_SOURCE_FILE_SIZE = 20 * 1024 * 1024;

// Converte o arquivo escolhido no seletor nativo em um data URL já redimensionado — sem isso, uma
// foto de celular direto da câmera (vários MB) viraria uma string enorme guardada em
// MachineImage.url. Mantém o payload da requisição bem abaixo de qualquer limite de corpo de
// requisição e, mais importante, o HTML de cada página que lista a máquina (catálogo, destaques da
// home, painel do proprietário) mais enxuto — essas imagens vêm embutidas ali, não como requisição
// HTTP separada que o navegador possa paralelizar ou cachear.
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
