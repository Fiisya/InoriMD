import axios from "axios";
import FormData from "form-data";
import { fileTypeFromBuffer } from "file-type";

// Fungsi upload file ke api.platform.web.id
export default async function uploadFile(buffer) {
  // Deteksi tipe file
  const type = await fileTypeFromBuffer(buffer);

  if (!type) {
    throw new Error("File type tidak terdeteksi atau tidak valid.");
  }

  const { ext, mime } = type;

  // Buat form data
  const form = new FormData();
  form.append("file", buffer, {
    filename: `file_${Date.now()}.${ext}`,
    contentType: mime,
  });

  try {
    const { data } = await axios.post("https://api.platform.web.id/upload", form, {
      headers: {
        ...form.getHeaders(),
        Accept: "application/json",
      },
      timeout: 30000,
    });

    // Validasi response
    if (!data.success || !data.data?.url) {
      throw new Error(data.message || "Upload gagal: response tidak valid");
    }

    // Kembalikan langsung URL aja
    return data.data.url;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Terjadi kesalahan saat mengupload file";

    console.error("Upload error:", errorMessage);
    throw new Error(errorMessage);
  }
}
/* import fetch from 'node-fetch';

import FormData from 'form-data';

import { fileTypeFromBuffer } from 'file-type'

// * Upload image to catbox.moe

// * Supported all mimetype.

// * @param {Buffer} buffer Image Buffer

// * @return {Promise<string>}

 

export default async buffer => {

  let { ext } = await fileTypeFromBuffer(buffer);

  let bodyForm = new FormData();

  bodyForm.append("fileToUpload", buffer, "file." + ext);

  bodyForm.append("reqtype", "fileupload");

  let res = await fetch("https://catbox.moe/user/api.php", {

    method: "POST",

    body: bodyForm,

  });

  let data = await res.text();

  return data;

}*/