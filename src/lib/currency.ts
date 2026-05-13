import { ExchangeRateCache } from './types';

// 使用 frankfurter.app（免费，无需 API Key）
const API_BASE = 'https://api.frankfurter.app';
const CACHE_KEY = 'travel-splitter-fx-rates';
const CACHE_TTL = 60 * 60 * 1000; // 1 小时

/** 内存中的汇率缓存 */
let memoryCache: ExchangeRateCache | null = null;

/** 从 localStorage 读取缓存 */
function loadCache(): ExchangeRateCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw) as ExchangeRateCache;
    // 检查是否过期
    if (Date.now() - cache.timestamp > CACHE_TTL) return null;
    return cache;
  } catch {
    return null;
  }
}

/** 将缓存写入 localStorage */
function saveCache(cache: ExchangeRateCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage 满或不可用，忽略
  }
}

/**
 * 获取所有汇率（以 CNY 为基准）。
 * 先从缓存读取，过期后异步刷新。缓存未命中时同步请求。
 */
export async function getExchangeRates(
  base = 'CNY'
): Promise<Record<string, number>> {
  // 尝试内存缓存
  if (memoryCache && Date.now() - memoryCache.timestamp <= CACHE_TTL) {
    return memoryCache.rates;
  }

  // 尝试 localStorage 缓存
  const localCache = loadCache();
  if (localCache) {
    memoryCache = localCache;
    // 后台刷新
    fetchFreshRates(base).catch(() => {});
    return localCache.rates;
  }

  // 无缓存，同步获取
  return fetchFreshRates(base);
}

/** 从 API 获取最新汇率 */
async function fetchFreshRates(
  base: string
): Promise<Record<string, number>> {
  try {
    const res = await fetch(`${API_BASE}/latest?from=${base}`);
    if (!res.ok) throw new Error(`汇率 API 返回 ${res.status}`);
    const json = await res.json();
    const cache: ExchangeRateCache = {
      rates: json.rates as Record<string, number>,
      base,
      timestamp: Date.now(),
    };
    memoryCache = cache;
    saveCache(cache);
    return cache.rates;
  } catch (err) {
    // 如果有过期缓存，降级使用
    if (memoryCache) return memoryCache.rates;
    const localCache = loadCache();
    if (localCache) {
      memoryCache = localCache;
      return localCache.rates;
    }
    console.error('获取汇率失败，且无缓存可用', err);
    // 最后降级：返回 1:1 汇率（至少不崩溃）
    return {};
  }
}

/**
 * 将金额从一种币种转换为另一种币种。
 * 金额单位为分，返回值也是分。
 */
export function convertAmount(
  amountCents: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amountCents;

  // frankfurter.app 的 rates 是 "1 基准币种 = X 目标币种" 的格式
  // 我们需要：先换算成基准币种，再换算成目标币种
  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (!fromRate || !toRate) return amountCents;

  // 转为基准币种（CNY）的值
  const baseAmount = Math.round(amountCents / fromRate);
  // 转为目标币种
  return Math.round(baseAmount * toRate);
}

/**
 * 将金额转换为人民币（分）。
 * 用于结算时统一货币。
 */
export function convertToCNY(
  amountCents: number,
  fromCurrency: string,
  rates: Record<string, number>
): number {
  if (fromCurrency === 'CNY') return amountCents;
  const rate = rates[fromCurrency];
  if (!rate) return amountCents; // 汇率未知，保持原值
  return Math.round(amountCents / rate);
}
