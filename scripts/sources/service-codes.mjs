// SAMHSA FindTreatment.gov service taxonomy -> data/service-codes.json
import { download } from '../lib/fetch.mjs';

const url = 'https://findtreatment.gov/locator/serviceCategories.json';

export default {
  id: 'serviceCodes',
  file: 'service-codes.json',
  async build() {
    const { buf } = await download(url);
    const categories = JSON.parse(buf.toString('utf8')).map((c) => ({
      code: c.categoryCode.trim(),
      name: c.categoryName.trim(),
      sa: c.saCategory === 'Y',
      mh: c.mhCategory === 'Y',
      services: c.serviceCodeList.map((s) => ({
        code: s.serviceCode.trim(),
        // The feed contains a few mis-encoded registered-trademark characters.
        name: s.serviceName.replace(/�|®/g, '').replace(/\s+/g, ' ').trim(),
        sa: s.saCode === 'Y',
        mh: s.mhCode === 'Y',
      })),
    }));
    return { data: { categories }, meta: { url, categories: categories.length } };
  },
};
