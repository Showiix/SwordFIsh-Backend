'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 为 products 表的 title 和 description 字段添加全文索引
    // 🤔 为什么使用 FULLTEXT 索引？
    // 答：MySQL 全文索引支持中文分词和相关性排序，比 LIKE 查询快很多

    await queryInterface.sequelize.query(`
      ALTER TABLE products
      ADD FULLTEXT INDEX ft_title_description (title, description) WITH PARSER ngram
    `);

    // ngram parser 支持中文、日文、韩文等
    // n-gram 会将文本分成连续的字符组合（默认 2 个字符）
  },

  async down (queryInterface, Sequelize) {
    // 删除全文索引
    await queryInterface.sequelize.query(`
      ALTER TABLE products
      DROP INDEX ft_title_description
    `);
  }
};
