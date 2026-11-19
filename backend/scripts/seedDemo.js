import "dotenv/config";
import { constants } from "node:fs";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import validator from "validator";
import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = path.resolve(backendDir, "..", "frontend", "src", "assets");
const dishes = [
    { _id: "d3e000000000000000000001", name: "Demo Greek Salad", description: "A fresh Greek-style salad.", price: 85, category: "Salad", source: "food_1.png" },
    { _id: "d3e000000000000000000002", name: "Demo Chicken Sandwich", description: "A chicken sandwich served fresh.", price: 95, category: "Sandwich", source: "food_13.png" },
    { _id: "d3e000000000000000000003", name: "Demo Cheese Pasta", description: "Pasta served with cheese.", price: 120, category: "Pasta", source: "food_25.png" },
    { _id: "d3e000000000000000000004", name: "Demo Vanilla Ice Cream", description: "A serving of vanilla ice cream.", price: 55, category: "Deserts", source: "food_12.png" }
];

export async function seedDemo({ email, password, uploadsDir = path.join(backendDir, "uploads") }) {
    await userModel.init();
    const user = await userModel.updateOne(
        { email },
        { $setOnInsert: { name: "Demo Customer", email, password: await bcrypt.hash(password, 10) } },
        { upsert: true }
    );

    await mkdir(uploadsDir, { recursive: true });
    let featuredCount = await foodModel.countDocuments({ isFeatured: true });
    let created = 0;
    for (const { source, ...dish } of dishes) {
        const image = `demo-${source}`;
        const sourcePath = path.join(assetsDir, source);
        const destination = path.join(uploadsDir, image);
        try {
            await copyFile(sourcePath, destination, constants.COPYFILE_EXCL);
        } catch (error) {
            if (error.code !== "EEXIST") throw error;
            const [existing, original] = await Promise.all([readFile(destination), readFile(sourcePath)]);
            if (!existing.equals(original)) throw new Error(`Image ${image} already exists with different contents`);
        }
        const isFeatured = featuredCount < 4;
        const result = await foodModel.updateOne(
            { _id: dish._id },
            { $setOnInsert: { ...dish, image, isFeatured, featuredUpdatedAt: isFeatured ? new Date() : null } },
            { upsert: true }
        );
        if (result.upsertedCount) {
            created += 1;
            if (isFeatured) featuredCount += 1;
        }
    }
    return { customerCreated: user.upsertedCount === 1, dishesCreated: created };
}

async function main() {
    if (!process.stdin.isTTY) throw new Error("Run this command in an interactive terminal");
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI must be configured");

    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Target customer database: ${mongoose.connection.name}`);
    console.log("Use a dedicated demo database, not production.");

    let muted = false;
    const output = new Writable({
        write(chunk, encoding, callback) {
            if (!muted) process.stdout.write(chunk, encoding);
            callback();
        }
    });
    const readline = createInterface({ input: process.stdin, output, terminal: true });
    let confirmation, email, password;
    try {
        confirmation = await readline.question("Type the database name to confirm: ");
        if (confirmation !== mongoose.connection.name) throw new Error("Database confirmation did not match; nothing was seeded");
        email = (await readline.question("Demo customer email: ")).trim().toLowerCase();
        process.stdout.write("Demo customer password (at least 8 characters, at most 72 UTF-8 bytes, input hidden): ");
        muted = true;
        password = await readline.question("");
        muted = false;
        process.stdout.write("\n");
    } finally {
        readline.close();
    }
    if (!validator.isEmail(email) || password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
        throw new Error("Enter a valid email and a password of at least 8 characters and at most 72 UTF-8 bytes");
    }
    const result = await seedDemo({ email, password });
    console.log(result.customerCreated ? "Demo customer created." : "Customer already exists; account was not changed.");
    console.log(`Created ${result.dishesCreated} demo dishes; existing demo dishes were not changed.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    main().catch(error => {
        console.error("Could not seed demo data:", error.message);
        process.exitCode = 1;
    }).finally(() => mongoose.disconnect());
}
