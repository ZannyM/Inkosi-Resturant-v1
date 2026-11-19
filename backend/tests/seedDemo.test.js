import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import bcrypt from "bcrypt";
import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import { seedDemo } from "../scripts/seedDemo.js";

test("demo seeding is repeatable and preserves existing accounts, dishes and images", async t => {
    const uploadsDir = await mkdtemp(path.join(os.tmpdir(), "inkosi-seed-test-"));
    const original = {
        init: userModel.init, userUpdate: userModel.updateOne,
        foodCount: foodModel.countDocuments, foodUpdate: foodModel.updateOne
    };
    t.after(async () => {
        userModel.init = original.init;
        userModel.updateOne = original.userUpdate;
        foodModel.countDocuments = original.foodCount;
        foodModel.updateOne = original.foodUpdate;
        await rm(uploadsDir, { recursive: true, force: true });
    });

    const users = new Map();
    const foods = new Map();
    userModel.init = async () => {};
    userModel.updateOne = async ({ email }, update) => {
        if (users.has(email)) return { upsertedCount: 0 };
        users.set(email, update.$setOnInsert);
        return { upsertedCount: 1 };
    };
    foodModel.countDocuments = async () => 2 + [...foods.values()].filter(food => food.isFeatured).length;
    foodModel.updateOne = async ({ _id }, update) => {
        if (foods.has(_id)) return { upsertedCount: 0 };
        foods.set(_id, update.$setOnInsert);
        return { upsertedCount: 1 };
    };

    const options = { email: "demo@example.com", password: "example-password", uploadsDir };
    assert.deepEqual(await seedDemo(options), { customerCreated: true, dishesCreated: 4 });
    assert.equal(await bcrypt.compare(options.password, users.get(options.email).password), true);
    assert.equal([...foods.values()].filter(food => food.isFeatured).length, 2);
    assert.ok((await readFile(path.join(uploadsDir, "demo-food_1.png"))).length > 0);

    const firstUser = users.get(options.email);
    const firstDish = foods.values().next().value;
    firstDish.name = "Edited dish";
    assert.deepEqual(await seedDemo({ ...options, password: "different-password" }), {
        customerCreated: false, dishesCreated: 0
    });
    assert.equal(users.get(options.email), firstUser);
    assert.equal(firstDish.name, "Edited dish");

    const imagePath = path.join(uploadsDir, "demo-food_1.png");
    await writeFile(imagePath, "existing image");
    await assert.rejects(seedDemo(options), /already exists with different contents/);
    assert.equal(await readFile(imagePath, "utf8"), "existing image");
});

test("demo seeding features all four dishes when no featured dishes exist", async t => {
    const uploadsDir = await mkdtemp(path.join(os.tmpdir(), "inkosi-seed-test-"));
    const original = {
        init: userModel.init, userUpdate: userModel.updateOne,
        foodCount: foodModel.countDocuments, foodUpdate: foodModel.updateOne
    };
    t.after(async () => {
        userModel.init = original.init;
        userModel.updateOne = original.userUpdate;
        foodModel.countDocuments = original.foodCount;
        foodModel.updateOne = original.foodUpdate;
        await rm(uploadsDir, { recursive: true, force: true });
    });
    const foods = [];
    userModel.init = async () => {};
    userModel.updateOne = async () => ({ upsertedCount: 1 });
    foodModel.countDocuments = async () => 0;
    foodModel.updateOne = async (filter, update) => {
        foods.push(update.$setOnInsert);
        return { upsertedCount: 1 };
    };

    await seedDemo({ email: "demo@example.com", password: "example-password", uploadsDir });
    assert.equal(foods.length, 4);
    assert.equal(foods.filter(food => food.isFeatured).length, 4);
});
