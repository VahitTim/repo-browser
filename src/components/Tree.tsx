import { ChevronDown } from "lucide-react";
import type { TreeNode } from "./RepoBrowser";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface TreeProps {
  node: TreeNode;
  level: number;
}

export default function Tree({ node, level }: TreeProps) {
  const hasChildren = node.children && Object.keys(node.children).length > 0;
  const hasRepos = node.repos.length > 0;
  const [expanded, setExpanded] = useState(true); // root открыт по умолчанию

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
              {node.repos.map((repo, i) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-0.5 hover:underline text-sm transition-all hover:text-white"
                >
                  {i + 1}. {repo.data.label}
                </a>
              ))}

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
