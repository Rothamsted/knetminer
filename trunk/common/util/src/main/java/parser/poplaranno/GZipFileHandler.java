package parser.poplaranno;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.zip.GZIPInputStream;

/**
 * Read some data from a gzip file.
 * 
 * @author huf
 * @date 05-03-2010
 */

public class GZipFileHandler {

	public BufferedReader ReadingGZipFile(String fileName) throws IOException {

		BufferedReader bReader = new BufferedReader(new InputStreamReader(
				new GZIPInputStream(new FileInputStream(fileName))));
		
//		 String line;
//		 // Now read lines of text: the BufferedReader puts them in lines,
//		 // the InputStreamReader does Unicode conversion, and the
//		 // GZipInputStream "gunzip"s the data from the FileInputStream.
//		 while ((line = bReader.readLine()) != null)
//		 System.out.println("Read: " + line);

		return bReader;

	}

	public void WritingToUnzippedFile(String fileName) throws IOException {

		// open the input (compressed) file.
		FileInputStream stream = new FileInputStream(fileName);
		FileOutputStream output = null;
		try {
			// open the gziped file to decompress.
			GZIPInputStream gzipstream = new GZIPInputStream(stream);
			byte[] buffer = new byte[2048];

			// create the output file without the .gz extension.
			String outname = fileName.substring(0, fileName.length() - 3);
			output = new FileOutputStream(outname);

			// and copy it to a new file
			int len;
			while ((len = gzipstream.read(buffer)) > 0) {
				output.write(buffer, 0, len);
			}
		} finally {
			// both streams must always be closed.
			if (output != null)
				output.close();
			stream.close();
		}

	}

	public static void main(String[] args) throws IOException {
		String fileName = ".\\data\\annotation.Ptrichocarpa_129_gene.gff3.gz";

		GZipFileHandler gh = new GZipFileHandler();
		//gh.WritingToUnzippedFile(fileName);
		gh.ReadingGZipFile(fileName);
		
	}
}