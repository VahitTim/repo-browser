import { ChevronDown } from "lucide-react";
import type { RepoInfo, TreeNode } from "./RepoBrowser";
import { cn, formatTimeDifference, txtToColor } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Card } from "./ui/card";

interface TreeProps {
  node: TreeNode;
  level: number;
}

export default function Tree({ node, level }: TreeProps) {
  const hasChildren = node.children && Object.keys(node.children).length > 0;
  const hasRepos = node.repos.length > 0;
  const [expanded, setExpanded] = useState(level < 5); // root открыт по умолчанию

  return (
    <div className="relative flex flex-col">
      {level > 1 && (
        <div
          onClick={() => setExpanded((prev) => !prev)}
          className={cn(
            "size-fit",
            "flex items-center gap-1 cursor-pointer select-none py-1 px-2 rounded-md transition-colors",
            "hover:bg-white/10"
          )}
        >
          {(hasRepos || hasChildren) && (
            <motion.div
              animate={{ rotate: expanded ? 0 : -90 }}
              transition={{ duration: 0.25 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          )}
          <span className="font-medium">{node.name}</span>
        </div>
      )}

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col ml-4 pl-2 border-l">
              {node.repos.map(repo => (<RepoField key={repo.id} repo={repo}/>))}
              {hasChildren &&
                Object.values(node.children!).map((child, i) => (
                  <Tree key={i} node={child} level={level + 1} />
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



const RepoField = ({repo} : {repo: RepoInfo}) => {
    return (
        <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center size-fit gap-2 py-0.5 text-sm transition-all"
        >
            <label
                className={cn("hover:underline p-1 rounded")}
                style={{backgroundColor: repo.data.color}}
            >{repo.data.label}</label>
            {repo.language
            &&
            <Card className="p-1 rounded-lg" style={{backgroundColor: txtToColor(repo.language)}}>
                {repo.language}
            </Card>}
            <Card className="p-1 rounded-lg">
                {formatTimeDifference(Date.parse(repo.created_at))}
            </Card>
            <Card className="p-1 rounded-lg">
                {formatTimeDifference(Date.parse(repo.updated_at))}
            </Card>
        </a>
    );
}