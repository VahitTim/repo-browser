import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export function formatTimeDifference(timestamp: number) {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

    if (diffInSeconds < 10) {
        return "прямо сейчас";
    } else if (diffInSeconds < 60) {
        return `${diffInSeconds} с. назад`;
    } else if (diffInSeconds < 60 * 60) {
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        return `${diffInMinutes} м. назад`;
    } else if (diffInSeconds < 60 * 60 * 24) {
        const diffInMinutes = Math.floor(diffInSeconds / 60 / 60);
        return `${diffInMinutes} ч. назад`;
    } else if (diffInSeconds < 60 * 60 * 24 * 7) {
        const diffInMinutes = Math.floor(diffInSeconds / 60 / 60 / 24);
        return `${diffInMinutes} д. назад`;
    } else {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
        const year = String(date.getFullYear()).slice(-2);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}. ${month}. ${year} ${hours}:${minutes}`;
    }
}


export const txtToColor = (text: string, rand: number = 1, alpha: number = 30): string => {
    let value: number = 0;
    for (let char of text) 
        value += char.charCodeAt(0) * rand * 3 + rand % 10 * 11


    return `hsl(${value}, 80%, 30%, ${alpha}%)`
} 