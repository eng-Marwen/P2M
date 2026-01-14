interface CloudinaryUploadOptions {
  folder?: string;
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  raw: any;
}

export async function uploadToCloudinary(
  file: File,
  { folder }: CloudinaryUploadOptions = {}
): Promise<CloudinaryResponse> {
  const url = `https://api.cloudinary.com/v1_1/dgmaxi7wu/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "react_web_project");
  if (folder) formData.append("folder", folder);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  // return secure url and public id so backend can remove if needed
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    raw: data,
  };
}

export async function uploadMultipleToCloudinary(
  files: File[] | FileList = [],
  opts: CloudinaryUploadOptions = {}
): Promise<CloudinaryResponse[]> {
  const promises = Array.from(files).map((f) => uploadToCloudinary(f, opts));
  return Promise.all(promises);
}
