import React, { useEffect, useState, type JSX } from "react";

// Конфигурация — поменяй на свои значения
const GITHUB_OWNER = "cyber-limon";
const GITHUB_REPO = "Parallel_programming_technologies___Course_project";
const GITHUB_BRANCH = "main";

// Типы
type RepoEntry = {
  path: string;
  type: "blob" | "tree"; // blob — файл, tree — папка
  sha?: string;
};

type FilesJson = {
  tree: RepoEntry[];
};

type TreeNode = {
  name: string;
  path: string; // полный путь относительно репозитория
  type: "file" | "dir";
  children?: TreeNode[];
};

function buildTree(entries: RepoEntry[]): TreeNode[] {
  const root: Record<string, TreeNode> = {};

  // Вспомогательная функция для получения/создания узла
  const getOrCreate = (map: Record<string, TreeNode>, key: string, node: TreeNode) => {
    if (!map[key]) map[key] = node;
    return map[key];
  };

  for (const e of entries) {
    const parts = e.path.split("/");
    let curMap = root;
    let curPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      curPath = curPath ? `${curPath}/${part}` : part;
      const isLast = i === parts.length - 1;

      if (isLast && e.type === "blob") {
        // файл
        getOrCreate(curMap, part, {
          name: part,
          path: curPath,
          type: "file",
        });
      } else {
        // папка
        const node = getOrCreate(curMap, part, {
          name: part,
          path: curPath,
          type: "dir",
          children: [],
        });
        // спуститься внутрь
        if (!node.children) node.children = [];
        // подготовим новую map для уровня (поиск child-элементов по имени)
        const nextMap: Record<string, TreeNode> = {};
        for (const c of node.children) nextMap[c.name] = c;
        curMap = nextMap;
      }
    }
  }

  // Функция для преобразования map -> массив с вложениями
  const mapToArray = (map: Record<string, TreeNode>): TreeNode[] =>
    Object.values(map).sort((a, b) => a.name.localeCompare(b.name)).map((n) => {
      if (n.type === "dir" && n.children && n.children.length > 0) {
        // children уже в виде массива — но у нас возможно были созданные временные map-ы — нормально
        n.children = mapToArray(n.children!.reduce<Record<string, TreeNode>>((acc, cur) => {
          acc[cur.name] = cur; return acc;
        }, {}));
      }
      return n;
    });

  return mapToArray(root);
}

// Рекурсивный компонент дерева
const TreeView: React.FC<{
  nodes: TreeNode[];
  onFileClick: (path: string) => void;
  expanded?: Record<string, boolean>;
  toggleExpand?: (path: string) => void;
}> = ({ nodes, onFileClick, expanded = {}, toggleExpand }) => {
  return (
    <ul className="text-sm">
      {nodes.map((node) => (
        <li key={node.path} className="mb-1">
          {node.type === "dir" ? (
            <div>
              <button
                onClick={() => toggleExpand && toggleExpand(node.path)}
                className="flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-gray-100"
              >
                <span className="select-none">{expanded[node.path] ? "▾" : "▸"}</span>
                <span className="font-medium">{node.name}</span>
              </button>
              {expanded[node.path] && node.children && (
                <div className="pl-4">
                  <TreeView nodes={node.children} onFileClick={onFileClick} expanded={expanded} toggleExpand={toggleExpand} />
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onFileClick(node.path)}
              className="text-left w-full hover:bg-gray-100 px-2 py-1 rounded"
            >
              {node.name}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default function RepoBrowser(): JSX.Element {
  const [entries, setEntries] = useState<TreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Загружаем предварительно сгенерированный files.json из public/
    fetch("/files.json")
      .then((r) => {
        if (!r.ok) throw new Error("Не удалось загрузить files.json");
        return r.json() as Promise<FilesJson>;
      })
      .then((data) => {
        const tree = buildTree(data.tree);
        setEntries(tree);
      })
      .catch((e) => setError(String(e)));
  }, []);

  const toggleExpand = (path: string) => {
    setExpanded((s) => ({ ...s, [path]: !s[path] }));
  };

  const loadFile = async (path: string) => {
    setLoading(true);
    setSelectedFile(path);
    setContent(null);
    setError(null);

    try {
      const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Файл не найден (${res.status})`);
      const text = await res.text();
      setContent(text);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      {/* Левая колонка — дерево файлов */}
      <div className="border rounded-lg p-3 shadow-sm overflow-auto h-[80vh]">
        <h2 className="font-semibold mb-2">📂 Репозиторий {GITHUB_REPO}</h2>
        {error && <div className="text-red-500 mb-2">Ошибка: {error}</div>}
        {entries.length === 0 && !error ? (
          <div>Загрузка списка файлов…</div>
        ) : (
          <TreeView nodes={entries} onFileClick={loadFile} expanded={expanded} toggleExpand={toggleExpand} />
        )}
      </div>

      {/* Правая колонка — содержимое файла */}
      <div className="border rounded-lg p-3 shadow-sm overflow-auto h-[80vh]">
        <h2 className="font-semibold mb-2">{selectedFile ? `📄 ${selectedFile}` : "Выберите файл"}</h2>

        {loading && <p>⏳ Загружается...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {content !== null && (
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{content}</pre>
        )}

        {!loading && content === null && !error && (
          <p className="text-muted">Ни один файл не выбран</p>
        )}
      </div>
    </div>
  );
}
