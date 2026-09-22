"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Task } from "../lib/types";
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setTasks(await api<Task[]>("/api/tasks"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível carregar.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return { tasks, setTasks, loading, error, refresh };
}
