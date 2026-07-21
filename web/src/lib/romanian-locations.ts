export interface CountyData {
  name: string;
  code: string;
  cities: string[];
}

/**
 * Normalizes text by removing Romanian diacritics and accents
 * so typing 's' matches 'ș'/'ş', 't' matches 'ț'/'ţ', 'a' matches 'ă'/'â', 'i' matches 'î'.
 */
export function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .replace(/[șş]/g, 's')
    .replace(/[țţ]/g, 't')
    .replace(/[ăâ]/g, 'a')
    .replace(/î/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Filters and sorts items so that items STARTING with the query appear first,
 * followed by items containing the query later, with diacritic independence.
 */
export function searchLocations<T>(
  items: T[],
  getText: (item: T) => string,
  query: string
): T[] {
  const q = normalizeText(query.trim());
  if (!q) return items;

  const matches = items.filter((item) => normalizeText(getText(item)).includes(q));

  return matches.sort((a, b) => {
    const textA = normalizeText(getText(a));
    const textB = normalizeText(getText(b));

    const startsA = textA.startsWith(q);
    const startsB = textB.startsWith(q);

    if (startsA && !startsB) return -1;
    if (!startsA && startsB) return 1;

    return textA.localeCompare(textB, 'ro');
  });
}

export const ROMANIAN_COUNTIES: CountyData[] = [
  {
    name: 'Timiș',
    code: 'TM',
    cities: [
      'Timișoara', 'Lugoj', 'Sânnicolau Mare', 'Jimbolia', 'Recaș', 'Buziaș', 'Făget', 'Deta', 'Gătaia', 'Ciacova',
      'Dumbravița', 'Giroc', 'Ghiroda', 'Moșnița Nouă', 'Săcălaz', 'Șag', 'Orțișoara', 'Sânandrei', 'Becicherecu Mic',
      'Covaci', 'Liebling', 'Peciu Nou', 'Parța', 'Giarmata', 'Remetea Mare', 'Dudeștii Noi', 'Variaș', 'Lovrin',
      'Gottlob', 'Biled', 'Chevereșu Mare', 'Foeni', 'Jamu Mare', 'Moravița', 'Nițchidorf', 'Pădureni', 'Teremia Mare',
      'Victor Vlad Delamarina', 'Voiteg', 'Bănloc', 'Birda', 'Bogda', 'Boldur', 'Carpiniș', 'Cenad', 'Cenei',
      'Comloșu Mare', 'Coșteiu', 'Criciova', 'Darova', 'Denta', 'Dudeștii Vechi', 'Dumbrava', 'Fibis', 'Găvojdia',
      'Ghilad', 'Giroc (Chișoda)', 'Giuchici', 'Lenauheim', 'Livezile', 'Mănăștiur', 'Margina', 'Mașloc', 'Nădrag',
      'Otelec', 'Periam', 'Pesac', 'Pietroasa', 'Racovița', 'Sânpetru Mare', 'Saravale', 'Sacoșu Turcesc', 'Secaș',
      'Șandra', 'Tomnatic', 'Tormac', 'Traian Vuia', 'Uivar', 'Valcani'
    ],
  },
  {
    name: 'București',
    code: 'B',
    cities: ['București', 'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6'],
  },
  {
    name: 'Alba',
    code: 'AB',
    cities: ['Alba Iulia', 'Sebeș', 'Aiud', 'Blaj', 'Cugir', 'Ocna Mureș', 'Zlatna', 'Câmpeni', 'Abrud', 'Baia de Arieș', 'Vințu de Jos', 'Teiuș', 'Ighiu', 'Unirea', 'Şugag', 'Biertan'],
  },
  {
    name: 'Arad',
    code: 'AR',
    cities: ['Arad', 'Ineu', 'Lipova', 'Sebiș', 'Nădlac', 'Pâncota', 'Curtici', 'Chișineu-Criș', 'Sântana', 'Vinga', 'Șag', 'Șiria', 'Vladimirescu', 'Pecica', 'Ghioroc', 'Zăbrani', 'Macea'],
  },
  {
    name: 'Argeș',
    code: 'AG',
    cities: ['Pitești', 'Câmpulung', 'Curtea de Argeș', 'Mioveni', 'Costești', 'Topoloveni', 'Ștefănești', 'Bascov', 'Bradu', 'Băiculești', 'Călinești', 'Mărăcineni', 'Vedea'],
  },
  {
    name: 'Bacău',
    code: 'BC',
    cities: ['Bacău', 'Onești', 'Moinești', 'Comănești', 'Buhuși', 'Dărmănești', 'Slănic-Moldova', 'Târgu Ocna', 'Mărgineni', 'Dofteana', 'Sascut', 'Gura Văii'],
  },
  {
    name: 'Bihor',
    code: 'BH',
    cities: ['Oradea', 'Salonta', 'Beiuș', 'Marghita', 'Aleșd', 'Ștei', 'Valea lui Mihai', 'Săcueni', 'Nucet', 'Vașcău', 'Sânmartin', 'Băile Felix', 'Oșorhei', 'Nojorid', 'Girișu de Criș'],
  },
  {
    name: 'Bistrița-Năsăud',
    code: 'BN',
    cities: ['Bistrița', 'Năsăud', 'Beclean', 'Sângeorz-Băi', 'Prundu Bârgăului', 'Maieru', 'Telciu', 'Rodna', 'Feldru'],
  },
  {
    name: 'Botoșani',
    code: 'BT',
    cities: ['Botoșani', 'Dorohoi', 'Darabani', 'Săveni', 'Ștefănești', 'Bucecea', 'Flămânzi', 'Vorona', 'Mihai Eminescu'],
  },
  {
    name: 'Brașov',
    code: 'BV',
    cities: ['Brașov', 'Făgăraș', 'Săcele', 'Zărnești', 'Râșnov', 'Codlea', 'Predeal', 'Victoria', 'Rupea', 'Ghimbav', 'Bran', 'Moieciu', 'Cristian', 'Hărman', 'Sânpetru', 'Feldioara', 'Prejmer', 'Bod'],
  },
  {
    name: 'Brăila',
    code: 'BR',
    cities: ['Brăila', 'Ianca', 'Însurăței', 'Făurei', 'Vădeni', 'Chiscani', 'Tichilești', 'Cazasu'],
  },
  {
    name: 'Buzău',
    code: 'BZ',
    cities: ['Buzău', 'Râmnicu Sărat', 'Nehoiu', 'Pătârlagele', 'Pogoanele', 'Berca', 'Mărăcineni', 'Vadu Pașii', 'Vernești'],
  },
  {
    name: 'Caraș-Severin',
    code: 'CS',
    cities: ['Reșița', 'Caransebeș', 'Bocșa', 'Moldova Nouă', 'Oravița', 'Oțelu Roșu', 'Băile Herculane', 'Anina', 'Mehadia', 'Teregova'],
  },
  {
    name: 'Călărași',
    code: 'CL',
    cities: ['Călărași', 'Oltenița', 'Budești', 'Lehliu Gară', 'Fundulea', 'Modelu', 'Borcea', 'Chirnogi'],
  },
  {
    name: 'Cluj',
    code: 'CJ',
    cities: ['Cluj-Napoca', 'Turda', 'Dej', 'Câmpia Turzii', 'Gherla', 'Huedin', 'Florești', 'Baciu', 'Apahida', 'Gilău', 'Chinteni', 'Săvădisla', 'Jucu', 'Feleacu', 'Aiton', 'Căpușu Mare'],
  },
  {
    name: 'Constanța',
    code: 'CT',
    cities: ['Constanța', 'Mangalia', 'Medgidia', 'Năvodari', 'Cernavodă', 'Ovidiu', 'Eforie', 'Techirghiol', 'Hârșova', 'Negru Vodă', 'Mamaia', 'Valu lui Traian', 'Agigea', 'Luminița', 'Mihail Kogălniceanu', 'Poarta Albă'],
  },
  {
    name: 'Covasna',
    code: 'CV',
    cities: ['Sfântu Gheorghe', 'Târgu Secuiesc', 'Covasna', 'Baraolt', 'Întorsura Buzăului', 'Zăbala', 'Ghelința'],
  },
  {
    name: 'Dâmbovița',
    code: 'DB',
    cities: ['Târgoviște', 'Moreni', 'Pucioasa', 'Găești', 'Fieni', 'Titu', 'Răcari', 'Razvad', 'Aninoasa', 'Băleni', 'Crevedia'],
  },
  {
    name: 'Dolj',
    code: 'DJ',
    cities: ['Craiova', 'Băilești', 'Calafat', 'Filiași', 'Dăbuleni', 'Segarcea', 'Bechet', 'Podari', 'Șimnicu de Sus', 'Ișalnița', 'Ciupercenii Noi'],
  },
  {
    name: 'Galați',
    code: 'GL',
    cities: ['Galați', 'Tecuci', 'Târgu Bujor', 'Berești', 'Pechea', 'Ivești', 'Liești', 'Șendreni', 'Vânători'],
  },
  {
    name: 'Giurgiu',
    code: 'GR',
    cities: ['Giurgiu', 'Mihăilești', 'Bolintin-Vale', 'Comana', 'Adunații-Copăceni', 'Ulmi', 'Ogrezeni'],
  },
  {
    name: 'Gorj',
    code: 'GJ',
    cities: ['Târgu Jiu', 'Motru', 'Rovinari', 'Bumbești-Jiu', 'Novaci', 'Țicleni', 'Tismana', 'Turceni', 'Târgu Cărbunești', 'Runcu'],
  },
  {
    name: 'Harghita',
    code: 'HR',
    cities: ['Miercurea Ciuc', 'Odorheiu Secuiesc', 'Gheorgheni', 'Toplița', 'Cristuru Secuiesc', 'Băile Tușnad', 'Bălan', 'Vlăhița', 'Praid', 'Corund'],
  },
  {
    name: 'Hunedoara',
    code: 'HD',
    cities: ['Deva', 'Hunedoara', 'Petroșani', 'Vulcan', 'Lupeni', 'Petrila', 'Orăștie', 'Brad', 'Simeria', 'Hațeg', 'Uricani', 'Călan', 'Aninoasa'],
  },
  {
    name: 'Ialomița',
    code: 'IL',
    cities: ['Slobozia', 'Fetești', 'Urziceni', 'Țndărei', 'Amara', 'Fierbinți-Târg', 'Căzănești', 'Movilița'],
  },
  {
    name: 'Iași',
    code: 'IS',
    cities: ['Iași', 'Pașcani', 'Hârlău', 'Podu Iloaiei', 'Târgu Frumos', 'Miroslava', 'Ciurea', 'Valea Lupului', 'Tomești', 'Holboca', 'Belcești', 'Deleni'],
  },
  {
    name: 'Ilfov',
    code: 'IF',
    cities: ['Voluntari', 'Otopeni', 'Buftea', 'Pantelimon', 'Popești-Leordeni', 'Chitila', 'Măgurele', 'Bragadiru', 'Chiajna', 'Snagov', 'Ciolpani', 'Mogosoaia', 'Jilava', 'Cernica', 'Afumați', 'Balotești', 'Corbeanca', 'Ștefăneștii de Jos'],
  },
  {
    name: 'Maramureș',
    code: 'MM',
    cities: ['Baia Mare', 'Sighetu Marmației', 'Borșa', 'Vișeu de Sus', 'Baia Sprie', 'Cavnic', 'Tăuții-Măgherăuș', 'Șomcuta Mare', 'Ulmeni', 'Seini', 'Dragomirești', 'Săliștea de Sus'],
  },
  {
    name: 'Mehedinți',
    code: 'MH',
    cities: ['Drobeta-Turnu Severin', 'Orșova', 'Strehaia', 'Baia de Aramă', 'Vânju Mare', 'Șimian'],
  },
  {
    name: 'Mureș',
    code: 'MS',
    cities: ['Târgu Mureș', 'Reghin', 'Sighișoara', 'Târnăveni', 'Luduş', 'Sovata', 'Iernut', 'Miercurea Nirajului', 'Sângeorgiu de Mureș', 'Ungheni', 'Sântana de Mureș', 'Cristești'],
  },
  {
    name: 'Neamț',
    code: 'NT',
    cities: ['Piatra Neamț', 'Roman', 'Târgu Neamț', 'Bicaz', 'Roznov', 'Săbăoani', 'Dumbrava Roșie'],
  },
  {
    name: 'Olt',
    code: 'OT',
    cities: ['Slatina', 'Caracal', 'Balș', 'Corabia', 'Scornicești', 'Drăgănești-Olt', 'Piatra-Olt', 'Potcoava'],
  },
  {
    name: 'Prahova',
    code: 'PH',
    cities: ['Ploiești', 'Câmpina', 'Sinaia', 'Bușteni', 'Azuga', 'Băicoi', 'Breaza', 'Mizil', 'Vălenii de Munte', 'Slănic', 'Urlați', 'Boldești-Scăeni', 'Comarnic', 'Plopeni', 'Bucecea', 'Bărcănești', 'Brazii', 'Păulești'],
  },
  {
    name: 'Satu Mare',
    code: 'SM',
    cities: ['Satu Mare', 'Carei', 'Negrești-Oaș', 'Tășnad', 'Livada', 'Ardud', 'Medieșu Aurit'],
  },
  {
    name: 'Sălaj',
    code: 'SJ',
    cities: ['Zalău', 'Șimleu Silvaniei', 'Jibou', 'Cehu Silvaniei', 'Crasna', 'Sărmășag'],
  },
  {
    name: 'Sibiu',
    code: 'SB',
    cities: ['Sibiu', 'Mediaș', 'Cisnădie', 'Avrig', 'Agnita', 'Dumbraveni', 'Tălmaciu', 'Săliște', 'Miercurea Sibiului', 'Ocna Sibiului', 'Șelimbăr', 'Rășinari'],
  },
  {
    name: 'Suceava',
    code: 'SV',
    cities: ['Suceava', 'Fălticeni', 'Rădăuți', 'Câmpulung Moldovenesc', 'Vatra Dornei', 'Gura Humorului', 'Siret', 'Solca', 'Vicovu de Sus', 'Dolhasca', 'Liteni', 'Salcea', 'Șcheia'],
  },
  {
    name: 'Teleorman',
    code: 'TR',
    cities: ['Alexandria', 'Roșiorii de Vede', 'Turnu Măgurele', 'Zimnicea', 'Videle'],
  },
  {
    name: 'Tulcea',
    code: 'TL',
    cities: ['Tulcea', 'Babadag', 'Măcin', 'Sulina', 'Isaccea', 'Jilava', 'Sarichioi'],
  },
  {
    name: 'Vaslui',
    code: 'VS',
    cities: ['Vaslui', 'Bârlad', 'Huși', 'Negrești', 'Murgeni', 'Zorleni'],
  },
  {
    name: 'Vâlcea',
    code: 'VL',
    cities: ['Râmnicu Vâlcea', 'Drăgășani', 'Băile Olănești', 'Băile Govora', 'Călimănești', 'Horezu', 'Brezoi', 'Bălcești', 'Berbești', 'Budești'],
  },
  {
    name: 'Vrancea',
    code: 'VN',
    cities: ['Focșani', 'Adjud', 'Mărășești', 'Panciu', 'Odobești', 'Homocea', 'Golești'],
  },
];
