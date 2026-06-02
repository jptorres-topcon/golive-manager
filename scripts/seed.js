import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@vercel/kv';

const kv = createClient({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const state = {
  groups: [
    { id: 'mpvujwz1a5uwy', name: 'Concrelongo - Piloto', startDate: '2026-06-02', endDate: '2026-06-02' },
    { id: 'mpwj9tfzlorf0', name: 'CRL01',                startDate: '2026-06-16', endDate: '2026-06-16' },
    { id: 'mpwjbq2ph9pxp', name: 'CRL02',                startDate: '2026-06-23', endDate: '2026-06-23' },
    { id: 'mpwje2iwtgids', name: 'CRL03',                startDate: '2026-06-30', endDate: '2026-07-01' },
    { id: 'mpwjfpoiljzr9', name: 'CRL04',                startDate: '2026-07-07', endDate: '2026-07-07' },
    { id: 'mpwjhm3w2655l', name: 'CRL05',                startDate: '2026-07-14', endDate: '2026-07-14' },
    { id: 'mpwjiwezhwd29', name: 'CRL06',                startDate: '2026-07-21', endDate: '2026-07-22' },
    { id: 'mpvujwz1m10z0', name: 'Longo & Vinhas',       startDate: '2026-07-28', endDate: '2026-07-29' },
    { id: 'mpvujwz10cbhh', name: 'Longo & Serviço',      startDate: '2026-07-30', endDate: '2026-07-30' },
  ],
  centrals: [
    { id: 'mpvujwz15mrzl', name: 'Campo Belo',                   goLiveDate: '2026-07-28', groupId: 'mpvujwz1m10z0', status: 'planejado' },
    { id: 'mpvujwz1glr8x', name: 'Canteiro - Santana da Vargem', goLiveDate: '2026-07-28', groupId: 'mpvujwz1m10z0', status: 'planejado' },
    { id: 'mpvujwz1ziz5y', name: 'Varginha',                     goLiveDate: '2026-07-28', groupId: 'mpvujwz1m10z0', status: 'planejado' },
    { id: 'mpvujwz1d3z1b', name: 'Poços de Caldas',              goLiveDate: '2026-07-29', groupId: 'mpvujwz1m10z0', status: 'planejado' },
    { id: 'mpvujwz1y1u3q', name: 'Lavras',                       goLiveDate: '2026-07-29', groupId: 'mpvujwz1m10z0', status: 'planejado' },
    { id: 'mpvujwz1c6y6r', name: 'Ilicínea',                     goLiveDate: '2026-07-29', groupId: 'mpvujwz1m10z0', status: 'planejado' },
    { id: 'mpvujwz1xzfug', name: 'Três Lagoas',                  goLiveDate: '2026-07-21', groupId: 'mpwjiwezhwd29', status: 'planejado' },
    { id: 'mpvujwz17d5oa', name: 'Concremax',                    goLiveDate: '2026-07-30', groupId: 'mpvujwz10cbhh', status: 'planejado' },
    { id: 'mpvujwz1nxtwf', name: 'Alfenas',                      goLiveDate: '2026-07-07', groupId: 'mpwjfpoiljzr9', status: 'planejado' },
    { id: 'mpvujwz10nx4g', name: 'Americana',                    goLiveDate: '2026-06-02', groupId: 'mpvujwz1a5uwy', status: 'andamento'  },
    { id: 'mpvujwz1b195v', name: 'Amparo',                       goLiveDate: '2026-06-23', groupId: 'mpwjbq2ph9pxp', status: 'planejado' },
    { id: 'mpvujwz13htr4', name: 'Arthur Nogueira',              goLiveDate: '2026-06-16', groupId: 'mpwj9tfzlorf0', status: 'planejado' },
    { id: 'mpvujwz1avnke', name: 'Barueri',                      goLiveDate: '2026-06-30', groupId: 'mpwje2iwtgids', status: 'planejado' },
    { id: 'mpvujwz1hx1yv', name: 'Cajamar',                      goLiveDate: '2026-06-30', groupId: 'mpwje2iwtgids', status: 'planejado' },
    { id: 'mpvujwz18wjlj', name: 'Embu das Artes',               goLiveDate: '2026-07-21', groupId: 'mpwjiwezhwd29', status: 'planejado' },
    { id: 'mpvujwz110hws', name: 'Espírito Santo de Pinhal',     goLiveDate: '2026-06-16', groupId: 'mpwj9tfzlorf0', status: 'planejado' },
    { id: 'mpvujwz1l9ly5', name: 'Extrema',                      goLiveDate: '2026-07-07', groupId: 'mpwjfpoiljzr9', status: 'planejado' },
    { id: 'mpvujwz1914zw', name: 'Hortolândia',                  goLiveDate: '2026-06-23', groupId: 'mpwjbq2ph9pxp', status: 'planejado' },
    { id: 'mpvujwz1v9w7w', name: 'Itupeva',                      goLiveDate: '2026-06-30', groupId: 'mpwje2iwtgids', status: 'planejado' },
    { id: 'mpvujwz1djbdo', name: 'Jacutinga',                    goLiveDate: '2026-07-14', groupId: 'mpwjhm3w2655l', status: 'planejado' },
    { id: 'mpvujwz1izcg2', name: 'Mogi Mirim',                   goLiveDate: '2026-06-16', groupId: 'mpwj9tfzlorf0', status: 'planejado' },
    { id: 'mpvujwz18wl5z', name: 'Paulínia',                     goLiveDate: '2026-06-23', groupId: 'mpwjbq2ph9pxp', status: 'planejado' },
    { id: 'mpvujwz1z57nn', name: 'Poços de Caldas',              goLiveDate: '2026-07-07', groupId: 'mpwjfpoiljzr9', status: 'planejado' },
    { id: 'mpvujwz18kca7', name: 'Socorro',                      goLiveDate: '2026-07-14', groupId: 'mpwjhm3w2655l', status: 'planejado' },
    { id: 'mpvujwz1f0ff8', name: 'Valinhos',                     goLiveDate: '2026-07-14', groupId: 'mpwjhm3w2655l', status: 'planejado' },
    { id: 'mpvujwz1w7b6v', name: 'Inocência',                    goLiveDate: '2026-07-22', groupId: 'mpwjiwezhwd29', status: 'planejado' },
    { id: 'mpvujwz14iusw', name: 'Canteiro Raposo',              goLiveDate: '2026-07-01', groupId: 'mpwje2iwtgids', status: 'planejado' },
    { id: 'mpvujwz1t5sdc', name: 'Canteiro Guarulhos/Reimix',    goLiveDate: '2026-07-22', groupId: 'mpwjiwezhwd29', status: 'planejado' },
  ],
  completed: [],
  sobreAviso: [],
};

console.log('Conectando ao Vercel KV...');
console.log('  URL:', process.env.KV_REST_API_URL);

await kv.set('golive_state_concrelongo', JSON.stringify(state));
console.log('✅ Dados gravados com sucesso!');

// Verificação — @vercel/kv já retorna o valor deserializado
const raw = await kv.get('golive_state_concrelongo');
// raw pode ser string JSON ou objeto, dependendo de como foi armazenado
const saved = typeof raw === 'string' ? JSON.parse(raw) : raw;
console.log(`✅ Verificado no KV:`);
console.log(`   Grupos   : ${saved.groups.length}`);
console.log(`   Centrais : ${saved.centrals.length}`);
console.log(`   Grupos   : ${saved.groups.map(g => g.name).join(', ')}`);
