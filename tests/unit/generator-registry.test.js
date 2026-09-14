/**
 * Generator Plugin Registry Conformance Tests
 * Validates that all registered symbology plugins satisfy the architectural specification.
 */

import {
  getAllGenerators,
  getGenerator,
  getGeneratorsByCategory,
  getCategories
} from '../../js/generators/registry.js';

export async function runRegistryTests(assert) {
  const all = getAllGenerators();

  assert.isTrue(all.length >= 8, `Registry contains at least 8 core symbology plugins (found ${all.length})`);

  // Check specific core IDs
  const requiredIds = ['qr-code', 'data-matrix', 'aztec', 'pdf417', 'ean-13', 'upc-a', 'code-128', 'itf-14'];
  requiredIds.forEach(id => {
    const plugin = getGenerator(id);
    assert.isTrue(!!plugin, `Plugin '${id}' is registered`);
  });

  // Verify Schema Interface Conformance for each plugin
  all.forEach(plugin => {
    assert.isTrue(typeof plugin.id === 'string' && plugin.id.length > 0, `Plugin '${plugin.name}' has valid id string`);
    assert.isTrue(typeof plugin.name === 'string' && plugin.name.length > 0, `Plugin '${plugin.id}' has valid name`);
    assert.isTrue(['2d', 'retail', 'logistics', 'postal'].includes(plugin.category), `Plugin '${plugin.id}' has recognized category '${plugin.category}'`);
    assert.isTrue(typeof plugin.description === 'string', `Plugin '${plugin.id}' has descriptive metadata`);
    assert.isTrue(typeof plugin.render === 'function', `Plugin '${plugin.id}' implements render() method`);
    
    // Schema checks
    assert.isTrue(!!plugin.schema, `Plugin '${plugin.id}' provides schema object`);
    assert.isTrue(plugin.schema.regex instanceof RegExp, `Plugin '${plugin.id}' has RegExp validation regex`);
    assert.isTrue(typeof plugin.schema.errorMessage === 'string', `Plugin '${plugin.id}' has errorMessage`);
  });

  // Category filtering
  const twoD = getGeneratorsByCategory('2d');
  assert.equal(twoD.length, 4, 'Category 2d returns 4 matrix plugins');

  const retail = getGeneratorsByCategory('retail');
  assert.equal(retail.length, 2, 'Category retail returns 2 POS plugins');

  const logistics = getGeneratorsByCategory('logistics');
  assert.equal(logistics.length, 2, 'Category logistics returns 2 shipping plugins');

  const categories = getCategories();
  assert.equal(categories.length, 4, 'Provides 4 UI category groups (All, 2D, Retail, Logistics)');
}
