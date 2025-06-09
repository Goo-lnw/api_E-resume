import { Context } from "elysia";
import { readFile, writeFile } from "fs/promises";
import { join, normalize } from "path";

export const imageController = {
    uploadImages: async (ctx: any) => {
        try {
            // console.log("have a image for upload");
            const parsedFormData = await ctx.request.formData();
            const publicUploadPath = join(process.cwd(), "public", "uploads");
            const allowedTypes = ["image/jpeg", "image/png"];
            const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
            const uploaded: any = {};
            for (const [key, file] of parsedFormData) {
                if (file instanceof File) {
                    // const file = value;
                    const { name, type, size } = file;
                    if (!name || !type) continue;
                    if (size > MAX_FILE_SIZE) {
                        throw `File ${name} exceeds max size of 5MB`;
                    }
                    if (!allowedTypes.includes(type)) {
                        throw `File type ${type} not allowed. Allowed: ${allowedTypes.join(
                            ", "
                        )}`;
                    }
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const uniqueFilename = `${Date.now()}_${name}`;
                    await writeFile(
                        join(publicUploadPath, uniqueFilename),
                        buffer
                    );
                    uploaded[
                        key
                    ] = `${process.env.API_SERVER_DOMAIN}/image/${uniqueFilename}`;
                }
            }
            // console.log(uploaded);
            return {
                status: 201,
                success: true,
                message: "Images was uploaded successfully",
                imagesData: uploaded,
            };
        } catch (error) {
            console.error("Unexpected error: ", error);
            return {
                status: 500,
                success: false,
                message: "Unexpected error",
                detail: error,
            };
        }
    },
    getImageByFilename: async ({
        params,
        set,
    }: Pick<Context, "params" | "set">) => {
        const safeFilename = normalize(params.filename).replace(
            /^(\.\.[\/\\])+/,
            ""
        ); // ป้องกัน path traversal
        const filePath = join(process.cwd(), "public", "uploads", safeFilename);
        // console.log(filePath);

        try {
            const image = await readFile(filePath);

            // Determine content-type
            let contentType = "application/octet-stream";
            if (params.filename.endsWith(".png")) {
                contentType = "image/png";
            } else if (
                params.filename.endsWith(".jpg") ||
                params.filename.endsWith(".jpeg")
            ) {
                contentType = "image/jpeg";
            } else if (params.filename.endsWith(".webp")) {
                contentType = "image/webp";
            }
            // console.log(contentType!);

            set.headers["content-type"] = contentType!;

            return image;
        } catch (err) {
            console.error(err);

            return {
                error: "Image not found",
                err,
            };
        }
    },
};
