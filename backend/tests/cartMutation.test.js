import test from "node:test";
import assert from "node:assert/strict";
import { mutateCart } from "../utils/cartMutation.js";

const createStore = (initial) => {
    let user = structuredClone(initial);
    return {
        read: async () => structuredClone(user),
        compareAndSwap: async (id, revision, next) => {
            if (user.cartRevision !== revision) return null;
            user = { ...user, cartData: next.cartData, savedData: next.savedData, cartMergeIds: next.mergeIds, cartMergeDigests: next.mergeDigests, cartRevision: (revision ?? 0) + 1 };
            return structuredClone(user);
        },
        current: () => structuredClone(user)
    };
};

test("concurrent updates retry without losing either change, including a missing revision", async () => {
    const store = createStore({ cartData: { food: 1 } });
    await Promise.all([
        mutateCart(store, "user", { type: "add", key: "food", entry: 1 }),
        mutateCart(store, "user", { type: "add", key: "food", entry: 1 })
    ]);
    assert.equal(store.current().cartData.food, 3);
    assert.equal(store.current().cartRevision, 2);
});

test("concurrent identical merges apply guest data only once", async () => {
    const store = createStore({ cartData: {}, cartRevision: 0 });
    const operation = { type: "merge", mergeId: "123e4567-e89b-42d3-a456-426614174000", cartData: { food: 2 }, savedData: { drink: 1 } };
    await Promise.all([mutateCart(store, "user", operation), mutateCart(store, "user", operation)]);
    assert.deepEqual(store.current().cartData, { food: 2 });
    assert.deepEqual(store.current().savedData, { drink: 1 });
    assert.equal(store.current().cartRevision, 1);
});

test("exhausted conflicts and missing users fail explicitly", async () => {
    await assert.rejects(mutateCart({ read: async () => ({ cartData: {}, cartRevision: 0 }), compareAndSwap: async () => null }, "user", { type: "clear", key: "food" }), { status: 409 });
    await assert.rejects(mutateCart({ read: async () => null }, "user", { type: "clear", key: "food" }), { status: 404 });
});

test("oversized merged data fails before saving any guest data", async () => {
    const store = createStore({ cartData: {}, cartRevision: 0 });
    const lines = Object.fromEntries(Array.from({ length: 260 }, (_, index) => [`food${index}`, { itemId: "food", quantity: 1, notes: "x".repeat(2000) }]));
    await assert.rejects(mutateCart(store, "user", { type: "merge", mergeId: "123e4567-e89b-42d3-a456-426614174000", cartData: lines, savedData: lines }), { status: 409 });
    assert.deepEqual(store.current().cartData, {});
    assert.equal(store.current().cartRevision, 0);
});