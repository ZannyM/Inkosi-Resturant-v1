import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import validator from "validator";
import { adminDb, connectAdminDB } from "../config/adminDb.js";
import adminUserModel from "../models/adminUserModel.js";
import adminRoleModel from "../models/adminRoleModel.js";
import { ADMIN_ROLES } from "../utils/adminRoles.js";
import { validAdminPassword } from "../utils/password.js";

async function main() {
    if (!process.stdin.isTTY) throw new Error("Run this command in an interactive terminal");
    let muted = false;
    const output = new Writable({
        write(chunk, encoding, callback) {
            if (!muted) process.stdout.write(chunk, encoding);
            callback();
        }
    });
    const readline = createInterface({ input: process.stdin, output, terminal: true });
    let username, email, password;
    try {
        username = (await readline.question("Username: ")).trim();
        email = (await readline.question("Email: ")).trim().toLowerCase();
        process.stdout.write("Password (12-72 UTF-8 bytes, input hidden): ");
        muted = true;
        password = await readline.question("");
        muted = false;
        process.stdout.write("\n");
    } finally {
        readline.close();
    }
    if (!username || username.length > 50 || email.length > 100 || !validator.isEmail(email) ||
        !validAdminPassword(password)) throw new Error("Invalid username, email, or password");

    if (!process.env.MONGO_URI) throw new Error("MONGO_URI must be configured");
    await mongoose.connect(process.env.MONGO_URI);
    await connectAdminDB();
    if (adminDb.name === mongoose.connection.name) {
        throw new Error("Admin and customer databases must have different database names");
    }
    await Promise.all([adminRoleModel.init(), adminUserModel.init()]);
    if (await adminUserModel.exists({})) throw new Error("Admin accounts already exist; use staff management");
    for (const role of ADMIN_ROLES) {
        await adminRoleModel.updateOne({ name: role.name }, { $set: role }, { upsert: true });
    }
    const manager = await adminRoleModel.findOne({ name: "Manager" });
    await adminUserModel.create({
        username, email, passwordHash: await bcrypt.hash(password, 10),
        role: manager._id, mustChangePassword: false
    });
    console.log("First Manager created.");
}

main().catch(error => {
    console.error("Could not create first Manager:", error.message);
    process.exitCode = 1;
}).finally(() => mongoose.disconnect());
