import info from "../../public/info.json";
import over from "../../public/over.json";
import { useState } from "react";
import { useFetchingEffect } from "../hooks/useFetchingEffect";
import Tree from "./Tree";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {  RotateCcw } from "lucide-react";

interface RepoData {
  label: string;
  path: string;
}

interface RepoInfo {
  id: number;
  name: string;
  html_url: string;
  data: RepoData;
}

export interface TreeNode {
  name: string;
  children?: Record<string, TreeNode>;
  repos: RepoInfo[];
}


export default function RepoBrowser() {
    const [reposInfo, setReposInfo] = useState(info.repos)
    const [repos, setRepos] = useState<RepoInfo[]>([])
    const [tree, setTree] = useState<TreeNode>({ name: "", children: {}, repos: [] });
    
    const image_url = `https://avatars.githubusercontent.com/u/${info.owner.id}?s=48&v=4`;
    const profile_url = `https://github.com/${info.owner.login}`;

    const handleRefresh = async () => {
        const response = await fetch(`https://api.github.com/users/${info.owner.login}/repos`);
        const data = await response.json();
        setReposInfo(data)
    }


    useFetchingEffect(async () => {
        const processed_info: RepoInfo[] = await Promise.all(
        reposInfo.map(async (i) => {
          const url = `https://raw.githubusercontent.com/${info.owner.login}/${i.name}/main/repoinfo/config.json`;
          const response = await fetch(url);
          const o = over.find(o => o.name && o.name === i.name)
          if (!response.ok)
            return { ...i, data: { label: i.name, path: "" , ...o?.data} };
          const result: RepoData = await response.json();
          return { ...i, data: result };
        })
      );
      setRepos(processed_info)
    }, [reposInfo])
    

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


  return (
    <div className="flex flex-col space-y-4 p-2">
        <Card className="md:size-fit p-3 flex flex-row items-center justify-between">
            <img className="rounded-full w-14 h-14" src={image_url} />
            <a href={profile_url} title="перейти в профиль">
            <div className="text-xl md:text-lg hover:underline hover:cursor-pointer">{info.owner.login}</div>
            </a>

            <Button onClick={handleRefresh}><RotateCcw/></Button>
        </Card>

        <div>Дерево:</div>
        <Tree node={tree} level={0}/>
    </div>
  );
}
