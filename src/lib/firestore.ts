import { useCallback, useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "./firebase";

const DEFAULT_ORDER_FIELD = "createdAt";

function getUserCollectionRef(uid: string, collectionName: string) {
  return collection(db, "users", uid, collectionName);
}

export function useUserCollection<T extends { id: string }>(
  uid: string | null,
  collectionName: string,
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      setLoading(false);
      return undefined;
    }

    const colRef = getUserCollectionRef(uid, collectionName);
    const q = query(colRef, orderBy(DEFAULT_ORDER_FIELD, "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setItems(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as T) })));
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [uid, collectionName]);

  const saveItem = useCallback(
    async (item: T) => {
      if (!uid) return;
      const itemRef = doc(getUserCollectionRef(uid, collectionName), item.id);
      await setDoc(itemRef, {
        ...item,
        updatedAt: new Date().toISOString(),
        createdAt: (item as { createdAt?: string }).createdAt || new Date().toISOString(),
      });
    },
    [uid, collectionName],
  );

  const deleteItem = useCallback(
    async (id: string) => {
      if (!uid) return;
      const itemRef = doc(getUserCollectionRef(uid, collectionName), id);
      await deleteDoc(itemRef);
    },
    [uid, collectionName],
  );

  return { items, loading, error, saveItem, deleteItem };
}
