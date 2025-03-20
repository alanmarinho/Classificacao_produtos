import fs from 'fs';
import { stringSimilarity } from 'string-similarity-js';
import natural from 'natural';
interface product {
  id: number;
  title: string;
  supermarket: string;
  price: number;
}

interface classifiedProduct {
  title: string;
  supermarket: string;
  price: number;
}

interface category {
  category: string;
  count: number;
  products: classifiedProduct[];
  specialCategory: string | undefined;
}

interface keyWordOrder {
  keyword: string;
  products: product[];
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-]/g, ' ');
}

// a ordem de keywordGroups influencia na preferencia de ordenação. EX: se o integral estiver acima de sem lactose e um item for integral e sem lactose, ele é classificado primeiro como integral.
const keywordGroups = {
  'sem lactose': ['sem lactose', 'zero lactose', 'zero-lactose', '0 lactose', 'sem-lactose'],
  integral: ['integral'],
  light: ['light'],
  'semi desnatado': ['semi desnatado', 'semi-desnatado'],
  desnatado: ['desnatado'],
};

function keywordOrder(products: product[]): keyWordOrder[] {
  let ordered: keyWordOrder[] = [];

  for (const product of products) {
    let normalizedTitle = normalizeText(product.title);
    let added = false;

    for (const [category, variations] of Object.entries(keywordGroups)) {
      for (const variation of variations) {
        if (normalizedTitle.includes(variation)) {
          let foundCategory = ordered.find((c) => c.keyword === category);

          if (!foundCategory) {
            foundCategory = { keyword: category, products: [] };
            ordered.push(foundCategory);
          }

          foundCategory.products.push(product);
          added = true;
          break;
        }
      }
      if (added) break;
    }

    if (!added) {
      let otherCategory = ordered.find((c) => c.keyword === 'other');
      if (!otherCategory) {
        otherCategory = { keyword: 'other', products: [] };
        ordered.push(otherCategory);
      }
      otherCategory.products.push(product);
    }
  }

  return ordered;
}

function getProducts() {
  const jsonData = fs.readFileSync('data01.json', 'utf-8');
  const produtos: product[] = JSON.parse(jsonData);
  return produtos;
}
let products: product[] = getProducts();

function similarityTitles(productTitle1: string, productTitle2: string) {
  return stringSimilarity(productTitle1, productTitle2);
}

function categorizarProdutos(categories: keyWordOrder[]): category[] {
  const classifiedCategories: category[] = [];

  for (const categorie of categories) {
    for (const product of categorie.products) {
      const existentCategory = classifiedCategories.find(
        (categories) => similarityTitles(product.title, categories.category) > 0.6,
      );
      if (existentCategory && existentCategory.specialCategory === categorie.keyword) {
        existentCategory.products.push(product);
        existentCategory.count++;
        existentCategory.specialCategory = categorie.keyword;
      } else {
        classifiedCategories.push({
          category: product.title,
          count: 1,
          products: [product],
          specialCategory: categorie.keyword,
        });
      }
    }
  }

  return classifiedCategories;
}

function findProducts(input: string, products: product[]): product[] {
  const itens: product[] = [];
  const similarityThreshold = 0.75;
  const comparator = natural.JaroWinklerDistance;

  for (const product of products) {
    const similarity = comparator(product.title.toLowerCase(), input.toLowerCase());

    if (similarity > similarityThreshold) {
      itens.push(product);
    }
  }

  return itens;
}

export function showProducts() {
  const categories = keywordOrder(products);
  return categorizarProdutos(categories);
}

export function searchForProduct(input: string) {
  return findProducts(input, products);
}
