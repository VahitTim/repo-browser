import React from 'react';
import type { TreeNode } from './RepoBrowser';
import { cn } from '@/lib/utils';

interface TreeProps {
    node: TreeNode;
    level: number;
}


const Tree = ({node, level} : TreeProps) => {
    const hasChildren = node.children && Object.keys(node.children).length > 0;
    console.log(node.name, hasChildren)
    return (
      <div className={cn(level > 1 && "pl-2")}>
        <div className="flex items-center gap-1 hover:cursor-pointer font-medium select-none">
            {node.name}
        </div>

        {node.repos.map((repo) => (
          <a
            key={repo.id}
            href={repo.html_url}
            className="block hover:underline"
            style={{ paddingLeft: `${(level + 1) * 20}px` }}
          >
            {repo.data.label}
          </a>
        ))}

        {hasChildren &&
          Object.values(node.children!).map((child, i) => <Tree key={i} node={child} level={level+1}/>)}
      </div>
    );
}

export default Tree;