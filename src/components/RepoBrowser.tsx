import data from "../../public/repo_info.json";
import info from "../../public/info.json";
import { useState, useEffect } from "react";

interface RepoData {
  label: string;
  path: string; // например "test/test1/test2"
}

interface RepoInfo {
  id: number;
  name: string;
  html_url: string;
  data: RepoData;
}


interface TreeNode {
  name: string;
  path: string;
  children?: Record<string, TreeNode>;
  repo?: RepoInfo;
}

export default function RepoBrowser() {
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [tree, setTree] = useState<TreeNode>({ name: "", path: "", children: {} });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({}); // для сворачивания/разворачивания

  const image_url = `https://avatars.githubusercontent.com/u/${data.owner.id}?s=48&v=4`;
  const profile_url = `https://github.com/${data.owner.name}`;

  useEffect(() => {
    async function fetchRepoData() {
      const proccing_info = await Promise.all(
        info.map(async (i) => {
          const url = `https://raw.githubusercontent.com/${data.owner.name}/${i.name}/main/repoinfo/config.json`;
          const response = await fetch(url);
          if (!response.ok)
            return { ...i, data: { label: i.name, path: "" } };
          const result: RepoData = await response.json();
          return { ...i, data: result };
        })
      );
      setRepos(proccing_info);

      const root: TreeNode = { name: "", path: "", children: {} };
      proccing_info.forEach((repo) => {
        const parts = repo.data.path.split("/")
        console.log(parts)
        let end = root

        parts.forEach((part, idx) => {
            if (!end.children) end.children = {}
            if (!end.children[part])
                end.children[part] = {name: part, path: parts.slice(0, idx + 1).join("/"), children: {}}
            end = end.children[part]
        })
        
        end.repo = repo

      });
      setTree(root);
      console.log(root)
    }

    fetchRepoData();
  }, []);

  const toggleExpand = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  // рекурсивный компонент дерева
  const renderTree = (node: TreeNode, level = 0) => {
    if (!node.children) return null;

    return Object.values(node.children).map((child) => {
      const isFolder = !child.repo; // если нет repo — это папка
      const isExpanded = expanded[child.path] ?? true; // по умолчанию раскрыта
      console.log(isFolder)
      return (
        <div key={child.path} style={{ paddingLeft: `${level * 20}px` }}>
          {isFolder ? (
            <div
              className="font-medium hover:cursor-pointer select-none flex items-center gap-1"
              onClick={() => toggleExpand(child.path)}
            >
              <span>{isExpanded ? "▾" : "▸"}</span>
              <span>{child.name}</span>
            </div>
          ) : (
            <a href={child.repo!.html_url}>
              <div className="hover:underline">{child.repo!.data.label}</div>
            </a>
          )}
          {isFolder && isExpanded && renderTree(child, level + 1)}
        </div>
      );
    });
  };

  return (
    <div>
      <div className="flex items-center gap-5 text-xl">
        <img className="rounded-full w-16 h-16" src={image_url} />
        <a href={profile_url} title="перейти в профиль">
          <div className="hover:underline hover:cursor-pointer">{data.owner.name}</div>
        </a>
      </div>

      <div className="mt-4">{renderTree(tree)}</div>
    </div>
  );
}
