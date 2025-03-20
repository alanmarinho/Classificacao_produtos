import readline from 'readline';
import { searchForProduct, showProducts } from './utils/search';
import fs from 'fs';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const loop = () => {
  rl.question(
    'Operações:\n 1 -> Categorização dos produtos\n "string de busca" -> buscar produto\n "sair" -> Exit code\na ',
    (name: string) => {
      switch (name) {
        case '1':
          const categories = showProducts();
          const jsonDataCategories = JSON.stringify(categories, null, 2);
          fs.writeFileSync('./classifiedProducts.json', jsonDataCategories, 'utf-8');

          console.log('Produtos classificados em ./classifiedProducts.json');
          break;
        case 'sair':
          console.log('Encerrando o programa...');
          rl.close();
          console.log('Digite CTRL + C para fechar o console');
          process.exit(0);

        default:
          const products = searchForProduct(name);
          const jsonDataProducts = JSON.stringify(products, null, 2);
          fs.writeFileSync('./searchForProduct.json', jsonDataProducts, 'utf-8');

          break;
      }
      loop();
    },
  );
};

loop();
