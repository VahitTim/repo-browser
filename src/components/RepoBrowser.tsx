import over from "../../public/over.json";
import { useState } from "react";
import { useFetchingEffect } from "../hooks/useFetchingEffect";
import Tree from "./Tree";
import { Card } from "./ui/card";

export interface RepoData {
    label: string;
    path: string;


    color?:string;
}

export interface RepoInfo {
    id: number;
    name: string;

    html_url: string;
    language: string;

    created_at: string;
    updated_at: string;

    data: RepoData;
}

export interface TreeNode {
  name: string;
  children?: Record<string, TreeNode>;
  repos: RepoInfo[];
}

const OVER: {name: string, data?:RepoData}[] = over
const image_url = "https://avatars.githubusercontent.com/u/{id}?s=48&v=4";
const profile_url = `https://github.com/{login}`;


export default function RepoBrowser({login} : {login: string}) {
    const [user, setUser] = useState<{login: string, id: number}>()

    useFetchingEffect(async () => {
        const responce = await fetch(`https://api.github.com/users/${login}`);
        const data = await responce.json()
        setUser(data)
    }, [login])



    
    const [repos, setRepos] = useState<RepoInfo[]>([])
    const [tree, setTree] = useState<TreeNode>({ name: "", children: {}, repos: [] });

    useFetchingEffect(async () => {
        const responseInfo = await fetch(`https://api.github.com/users/${login}/repos?per_page=100`)
        let reposInfo: RepoInfo[] = await responseInfo.json()

        const processed_info: RepoInfo[] = await Promise.all(
        reposInfo.map(async (i) => {
          const url = `https://raw.githubusercontent.com/${login}/${i.name}/main/repoinfo/config.json`;
          const response = await fetch(url);
          const over = OVER.find(o => o.name === i.name)
          if (!response.ok)
            return { ...i, data: { label: i.name, path: "" , ...over?.data} };
          const result: RepoData = await response.json();
          return { ...i, data: result };
        })
      );
      setRepos(processed_info)
    }, [login])


    useFetchingEffect(async () => {
        const root: TreeNode = { name: "", children: {}, repos: [] };

        repos.forEach((repo) => {
            const parts = repo.data.path.split("/")
            let current = root;
            parts.forEach(part => {
            if (!current.children) current.children = {};
            if (!current.children[part])
                current.children[part] = { name: part, children: {}, repos: [] };
            current = current.children[part];
            });
            current.repos.push(repo);
        });

        setTree(root);
        }, [repos]);


    if (!user) return;

  return (
    <div className="flex flex-col space-y-4 p-2">
        <Card className="md:size-fit p-3 flex flex-row items-center justify-between">
            <img className="rounded-full w-14 h-14" src={image_url.replace("{id}", user.id.toString())} />
            <a href={profile_url.replace("{login}", user.login)} title="перейти в профиль">
            <div className="text-xl md:text-lg hover:underline hover:cursor-pointer">{login}</div>
            </a>
        </Card>

        <div>Дерево:</div>
        <Tree node={tree} level={0}/>
    </div>
  );
}
