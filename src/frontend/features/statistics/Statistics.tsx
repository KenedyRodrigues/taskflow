"use client";
import { useTasks } from "@/frontend/hooks/useTasks";
import { labels, type Status } from "@/frontend/lib/types";
export default function Statistics() {
  const { tasks, loading, error, refresh } = useTasks();
  const counts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    doing: tasks.filter((t) => t.status === "doing").length,
    done: tasks.filter((t) => t.status === "done").length,
  };
  const total = tasks.length,
    percent = total ? Math.round((counts.done / total) * 100) : 0;
  const todo = total ? (counts.todo / total) * 100 : 0,
    doing = total ? (counts.doing / total) * 100 : 0;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">VISÃO GERAL</div>
          <h1>Estatísticas</h1>
          <p>A distribuição atual das suas tarefas.</p>
        </div>
      </div>
      {error ? (
        <div role="alert" className="message error">
          {error}
          <button onClick={refresh}>Tentar novamente</button>
        </div>
      ) : loading ? (
        <p role="status">Carregando estatísticas…</p>
      ) : (
        <>
          <section className="stats">
            <div className="stat-card">
              <div>
                <span>Total de tarefas</span>
                <strong>{total}</strong>
              </div>
            </div>
            {(Object.keys(labels) as Status[]).map((status) => (
              <div key={status} className="stat-card">
                <div>
                  <span>{labels[status]}</span>
                  <strong>{counts[status]}</strong>
                </div>
              </div>
            ))}
          </section>
          <section className="chart-panel">
            <div>
              <h2>Tarefas por status</h2>
              <p>
                {total
                  ? "Dados das tarefas existentes na sua conta."
                  : "Crie uma tarefa para começar a acompanhar os resultados."}
              </p>
            </div>
            <div className="chart-content">
              <div
                className="donut"
                role="img"
                aria-label={
                  "Distribuição: " +
                  counts.todo +
                  " a fazer, " +
                  counts.doing +
                  " em andamento e " +
                  counts.done +
                  " concluídas."
                }
                style={{
                  background: total
                    ? "conic-gradient(#d3a04b 0% " +
                      todo +
                      "%, #6b96c5 " +
                      todo +
                      "% " +
                      (todo + doing) +
                      "%, #438666 " +
                      (todo + doing) +
                      "% 100%)"
                    : "#e5eae6",
                }}
              >
                <div>
                  <strong>{percent}%</strong>
                  <span>concluídas</span>
                </div>
              </div>
              <div className="chart-bars">
                {(Object.keys(labels) as Status[]).map((status) => (
                  <div key={status}>
                    <div className="bar-label">
                      <span>{labels[status]}</span>
                      <strong>
                        {counts[status]}{" "}
                        <small>
                          (
                          {total
                            ? Math.round((counts[status] / total) * 100)
                            : 0}
                          %)
                        </small>
                      </strong>
                    </div>
                    <div className={"bar-track " + status}>
                      <span
                        style={{
                          width:
                            (total ? (counts[status] / total) * 100 : 0) + "%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
