import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs/promises';

const randomName = Array(32)
  .fill(null)
  .map(() => Math.round(Math.random() * 16).toString(16))
  .join('');

@Controller('upload')
export class UploadControllerController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const fileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '');

          console.log(fileName);
          return callback(null, `${fileName}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file) {
    const filePath = `./uploads/${file.filename}`;

    try {
      const pdfBuffer = await fs.readFile(filePath);
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      // Criar uma pasta com o nome do arquivo
      const folderPath = `./uploads/${file.filename.replace(/\.[^/.]+$/, '')}_${randomName}`;
      await fs.mkdir(folderPath, { recursive: true });

      // Fragmentar o PDF em arquivos individuais para cada página
      const filePromises = Array.from(
        { length: pdfDoc.getPageCount() },
        async (_, index) => {
          const copiedPages = await PDFDocument.create();
          const [copiedPage] = await copiedPages.copyPages(pdfDoc, [index]);
          copiedPages.addPage(copiedPage);

          const pageFilePath = `${folderPath}/${file.filename.replace(/\.[^/.]+$/, '')}_page_${index + 1}.pdf`;
          const pageBuffer = await copiedPages.save();
          await fs.writeFile(pageFilePath, pageBuffer);
          return pageFilePath;
        },
      );

      await Promise.all(filePromises);

      return {
        filename: file.filename,
        numberOfPages: pdfDoc.getPageCount(),
        pageFolder: folderPath,
      };
    } catch (error) {
      console.error('Erro ao ler o arquivo PDF:', error);
      throw new Error('Erro ao processar o arquivo PDF');
    }
  }
}
