import { useEffect, useMemo, useState } from "react";

interface TaskRound {
  id: string;
  totalSteps: number;
  currentStep: number;
  completedAt?: string | null;
  paidOut?: boolean;
}

interface TaskStatusResponse {
  success: boolean;
  dateKey: string;
  available: boolean;
  completedToday: boolean;
  nextAvailableAt: string;
  rewardAmount: number;
  round: TaskRound | null;
}

export const useTaskStatus = () => {
  const [data, setData] = useState<TaskStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setData(null);
        setLoading(false);
        return;
      }
      const tzOffsetMinutes = new Date().getTimezoneOffset();
      const res = await fetch("/api/tasks/status", {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tz-offset-minutes": String(tzOffsetMinutes),
        },
      });
      const json = (await res.json()) as TaskStatusResponse;
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const i = setInterval(fetchStatus, 30000);
    return () => clearInterval(i);
  }, []);

  const nextAvailableAtMs = useMemo(() => {
    if (!data?.nextAvailableAt) return null;
    const t = new Date(data.nextAvailableAt).getTime();
    return Number.isFinite(t) ? t : null;
  }, [data?.nextAvailableAt]);

  return {
    taskStatus: data,
    loading,
    refetch: fetchStatus,
    nextAvailableAtMs,
  };
};
