import React, { useEffect, useState } from "react";
import { authState } from "../store/authState.js";
import { useRecoilValue } from "recoil";

interface Todo {
  _id: string;
  title: string;
  description: string;
  done: boolean;
}

type TodoArray = Todo[];

const TodoList = () => {
  const [todos, setTodos] = useState<TodoArray>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const authStateValue = useRecoilValue(authState);

  // =========================
  // GET TODOS
  // =========================

  useEffect(() => {
    const getTodos = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/todo/todos",
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          console.error("Failed to fetch todos:", response.status);
          return;
        }

        const data: Todo[] = await response.json();

        setTodos(data);
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };

    getTodos();
  }, []);

  // =========================
  // ADD TODO
  // =========================

  const addTodo = async () => {
    if (!title.trim()) {
      alert("Please enter a todo title");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:3000/todo/todos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title,
            description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Add todo failed:", data);
        alert(data.error || data.message || "Failed to add todo");
        return;
      }

      setTodos((prevTodos) => [...prevTodos, data]);

      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Error adding todo:", error);
      alert("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // MARK TODO DONE
  // =========================

  const markDone = async (id: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/todo/todos/${id}/done`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const updatedTodo = await response.json();

      if (!response.ok) {
        alert(
          updatedTodo.error || "Failed to update todo"
        );
        return;
      }

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === updatedTodo._id
            ? updatedTodo
            : todo
        )
      );
    } catch (error) {
      console.error("Error marking todo:", error);
      alert("Could not connect to server");
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================= NAVBAR ================= */}

      <nav className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold">
              ✓
            </div>

            <span className="text-xl font-bold">
              TodoApp
            </span>
          </div>

          {/* User */}
          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">
              <p className="text-xs text-slate-500">
                Logged in as
              </p>

              <p className="text-sm font-medium text-slate-200">
                {authStateValue.username}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-400"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ================= MAIN ================= */}

      <main className="mx-auto max-w-4xl px-6 py-10">

        {/* Welcome */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-500">
            Your workspace
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back, {authStateValue.username} 👋
          </h1>

          <p className="mt-2 text-slate-400">
            Stay organized and get things done.
          </p>
        </div>

        {/* ================= ADD TODO ================= */}

        <div className="mb-10 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              Create a new task
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add something you want to accomplish.
            </p>
          </div>

          <div className="space-y-4">

            {/* Title */}

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

            {/* Description */}

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Add a description..."
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

            {/* Add */}

            <button
              onClick={addTodo}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Adding..." : "+ Add Todo"}
            </button>
          </div>
        </div>

        {/* ================= TASK HEADER ================= */}

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Your Tasks
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {todos.length}{" "}
              {todos.length === 1 ? "task" : "tasks"}
            </p>
          </div>
        </div>

        {/* ================= TODOS ================= */}

        <div className="space-y-4">

          {todos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-12 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-2xl">
                ✓
              </div>

              <h3 className="font-semibold text-slate-200">
                No tasks yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create your first todo above and get started.
              </p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo._id}
                className={`rounded-2xl border p-5 transition ${
                  todo.done
                    ? "border-green-500/20 bg-green-500/5"
                    : "border-slate-800 bg-slate-900 hover:border-slate-700"
                }`}
              >

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  {/* Content */}

                  <div className="min-w-0">

                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          todo.done
                            ? "bg-green-500/15 text-green-400"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {todo.done ? "✓" : "○"}
                      </div>

                      <h3
                        className={`truncate text-lg font-semibold ${
                          todo.done
                            ? "text-slate-500 line-through"
                            : "text-slate-100"
                        }`}
                      >
                        {todo.title}
                      </h3>
                    </div>

                    {todo.description && (
                      <p
                        className={`mt-2 pl-11 text-sm ${
                          todo.done
                            ? "text-slate-600"
                            : "text-slate-400"
                        }`}
                      >
                        {todo.description}
                      </p>
                    )}
                  </div>

                  {/* Button */}

                  <button
                    onClick={() => markDone(todo._id)}
                    disabled={todo.done}
                    className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
                      todo.done
                        ? "cursor-default bg-green-500/10 text-green-400"
                        : "bg-slate-800 text-slate-300 hover:bg-green-500 hover:text-white"
                    }`}
                  >
                    {todo.done
                      ? "Completed"
                      : "Mark as Done"}
                  </button>

                </div>
              </div>
            ))
          )}

        </div>
      </main>
    </div>
  );
};

export default TodoList;