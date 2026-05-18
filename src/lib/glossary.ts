import type {
  SilhouetteType,
  NecklineType,
  SleeveType,
  SleeveMaterial,
  WaistPosition,
  BodiceStructure,
  WaistAccent,
  BackType,
  SkirtTexture,
  SlitType,
  TrainLength,
  FabricType,
  ColorEnum,
  EmbellishmentType,
  VeilLength,
  VeilEdge,
  AccessoryType,
} from '../types';

export const SILHOUETTE_GLOSSARY: Record<SilhouetteType, string> = {
  aline: 'A-라인: 어깨에서 허리까지 fitted, 허리부터 자연스럽게 퍼지는 가장 클래식한 형태. 대부분의 체형에 잘 어울림.',
  mermaid: '머메이드: 가슴부터 허벅지 중간까지 몸에 밀착되고, 무릎 아래부터 플레어되는 형태. 곡선미를 강조.',
  trumpet: '트럼펫: 머메이드와 유사하나 플레어 시작 지점이 허벅지보다 위쪽(엉덩이 근처). 드라마틱한 실루엣.',
  princess: '프린세스: 수직 솔기(패널)가 앞뒤로 지나가며 자연스러운 A-라인을 만듦. 웨이스트 솔기 없이 유연한 핏.',
  sheath: '시스: 몸에 딱 맞게 떨어지는 직선적 형태. 슬림하고 모던한 인상. 움직임이 다소 제한될 수 있음.',
  empire: '엠파이어: 허리선이 가슴 바로 아래 높이 위치. 스커트가 길게 흘러내려 우아하고 로맨틱한 느낌.',
  fitFlare: '핏앤플레어: 상체는 피티드, 허리나 엉덩이선에서 스커트가 크게 퍼지는 형태. 활동성과 볼륨감 모두 확보.',
  tealength: '티렝스: 무릎과 발목 사이 길이(약 종아리 중간). 빈티지하고 발랄한 분위기.',
  mini: '미니: 허벅지 위 짧은 길이. 모던하고 파격적인 스타일. 리셉션 드레스로 활용하기도 함.',
};

export const NECKLINE_GLOSSARY: Record<NecklineType, string> = {
  sweetheart: '스위트하트: 가슴 윗부분이 하트 모양으로 파인 형태. 로맨틱하고 여성스러운 클래식 넥라인.',
  vRegular: 'V넥 (보통): 중간 깊이의 V형 파임. 목선을 길어 보이게 하고 세련된 인상을 줌.',
  vDeep: 'V넥 (깊은): 일반 V넥보다 더 깊게 파인 형태. 섹시하고 대담한 스타일.',
  vPlunging: '플런징 V넥: 가슴 아래까지 매우 깊게 파인 V넥. 강렬하고 드라마틱한 인상.',
  halter: '홀터넥: 목 뒤에서 고정되고 어깨와 등 위쪽이 드러나는 형태. 건강하고 활동적인 느낌.',
  offShoulder: '오프숄더: 양쪽 어깨 아래로 드레스 라인이 가는 형태. 어깨와 쇄골을 드러내 로맨틱한 분위기.',
  oneShoulder: '원숄더: 한쪽 어깨에만 스트랩이 걸리는 비대칭 넥라인. 모던하고 개성 있는 스타일.',
  strapless: '스트랩리스: 어깨끈 없이 가슴 위에서 수평으로 잘린 형태. 클래식하고 우아한 웨딩 드레스의 정석.',
  boat: '보트넥: 어깨 끝에서 끝까지 수평으로 파인 넥라인. 우아하고 절제된 분위기.',
  illusionCrew: '일루전 크루: 시어 소재로 목과 어깨를 덮어 피부가 비쳐 보이는 듯한 넥라인. 신비로운 효과.',
  square: '스퀘어넥: 네모 형태로 파인 넥라인. 빈티지하고 클래식한 느낌. 목선과 어깨를 강조.',
  scoop: '스쿱넥: 둥글게 깊이 파인 U자형 넥라인. 부드럽고 여성스러운 인상.',
  portrait: '포트레이트 넥라인: 어깨에서 완만하게 흘러내리는 넓은 배 모양. 초상화처럼 우아한 인상을 줌.',
  highNeck: '하이넥: 목을 덮는 높은 넥라인. 클래식하고 우아하며 보수적인 느낌. 겨울 웨딩에 적합.',
  keyhole: '키홀 넥라인: 목 부분에 열쇠구멍 모양의 개방부가 있는 형태. 독특하고 세련된 디테일.',
};

export const SLEEVE_GLOSSARY: Record<SleeveType, string> = {
  sleeveless: '민소매: 소매가 없는 형태. 여름 웨딩이나 스트랩리스 드레스에 적합.',
  cap: '캡 슬리브: 어깨 끝을 살짝 덮는 매우 짧은 소매. 귀엽고 여성스러운 느낌.',
  short: '반소매: 팔꿈치 위 짧은 소매. 클래식하고 단정한 인상.',
  threeQuarter: '7부 소매: 팔꿈치와 손목 사이 길이의 소매. 우아하고 실용적.',
  long: '긴 소매: 손목까지 내려오는 소매. 클래식하고 포멀한 느낌. 가을/겨울 웨딩에 적합.',
  bishop: '비숍 슬리브: 소매 끝(손목)에서 퍼프되며 커프스로 좁아지는 형태. 로맨틱하고 빈티지한 느낌.',
  puff: '퍼프 슬리브: 어깨 부분이 부풀어 오른 형태. 동화 같은 로맨틱한 분위기.',
  bell: '벨 슬리브: 팔꿈치나 손목에서 종 모양으로 넓게 퍼지는 소매. 보헤미안하고 우아한 느낌.',
  legOfMutton: '레그오브머튼: 어깨와 팔 상단이 부풀고 팔꿈치 아래는 타이트한 빅토리아 스타일 소매.',
  illusion: '일루전 슬리브: 시어 소재로 만들어 피부가 비쳐 보이는 소매. 섬세하고 신비로운 효과.',
};

export const SLEEVE_MATERIAL_GLOSSARY: Record<SleeveMaterial, string> = {
  opaque: '불투명: 일반 불투명 소재. 가장 기본적인 소매 마감.',
  sheer: '시어: 반투명 시폰·오간자 등. 우아하고 섬세한 느낌.',
  lace: '레이스: 레이스 소재. 로맨틱하고 클래식한 느낌.',
  beaded: '비딩: 비즈 장식이 된 소매. 화려하고 고급스러운 느낌.',
};

export const WAIST_POSITION_GLOSSARY: Record<WaistPosition, string> = {
  natural: '자연 허리: 실제 허리선 위치(배꼽 위). 가장 클래식하고 밸런스 좋은 비율.',
  empire: '엠파이어 허리: 가슴 바로 아래 높은 위치. 다리를 길어 보이게 하고 편안한 착용감.',
  basque: '바스크 허리: 허리선이 V자로 앞쪽이 뾰족하게 내려오는 형태. 우아하고 드라마틱.',
  drop: '드롭 허리: 허리선이 엉덩이 쪽으로 낮게 내려온 형태. 1920년대 스타일, 모던하고 개성 있음.',
  asymmetric: '비대칭 허리: 허리선이 한쪽으로 기울어진 비대칭 형태. 독특하고 아방가르드한 스타일.',
};

export const BODICE_STRUCTURE_GLOSSARY: Record<BodiceStructure, string> = {
  corset: '코르셋: 강하게 조여주는 구조적 보디스. 실루엣을 극적으로 강조하며 허리를 가늘게 보이게 함.',
  softFit: '소프트 핏: 부드럽게 몸에 맞는 형태. 편안하면서도 우아한 착용감.',
  peplum: '페플럼: 허리 아래에 작은 플레어 러플이 달린 형태. 여성스럽고 귀여운 느낌.',
  mockPeplum: '모크 페플럼: 페플럼처럼 보이지만 별도 레이어가 아닌 시각적 효과. 간결하면서 세련된 스타일.',
};

export const WAIST_ACCENT_GLOSSARY: Record<WaistAccent, string> = {
  none: '장식 없음: 허리 장식 없이 깔끔한 라인 그대로.',
  sash: '새시: 허리에 두르는 넓은 띠. 컬러 포인트를 줄 수 있음.',
  ribbon: '리본: 허리에 묶는 리본. 사랑스럽고 로맨틱한 느낌.',
  brooch: '브로치: 허리 포인트에 달린 장식 핀. 고급스럽고 클래식한 악센트.',
  beadedBand: '비딩 밴드: 비즈로 장식된 허리 밴드. 화려하고 화사한 느낌.',
};

export const BACK_GLOSSARY: Record<BackType, string> = {
  closed: '클로즈드 백: 등 전체가 덮인 형태. 보수적이고 격식 있는 스타일.',
  vBack: 'V백: 등 쪽이 V자로 파인 형태. 우아하면서 섹시한 느낌.',
  illusionBack: '일루전 백: 시어 소재로 등 부분을 덮어 피부가 비쳐 보이는 느낌. 신비롭고 세련된 스타일.',
  openBack: '오픈 백: 등이 크게 드러나는 형태. 대담하고 모던한 스타일.',
  keyhole: '키홀 백: 등에 열쇠구멍 형태의 개방부. 독특하고 디테일이 있는 스타일.',
  buttonRow: '버튼 로우: 등 중앙에 작은 버튼들이 줄지어 있는 형태. 클래식하고 로맨틱한 디테일.',
  laceUpCorset: '레이스업 코르셋: 등을 끈으로 조여 맬 수 있는 형태. 드라마틱하고 복고풍 느낌. 사이즈 조절 가능.',
  drape: '드레이프 백: 등 부분에 부드럽게 흘러내리는 드레이프. 우아하고 소프트한 느낌.',
};

export const SKIRT_TEXTURE_GLOSSARY: Record<SkirtTexture, string> = {
  smooth: '스무스: 매끈한 표면의 스커트. 클래식하고 심플한 스타일.',
  gathered: '개더드: 허리 부분에서 주름을 모아 볼륨을 만든 스커트. 풍성하고 로맨틱.',
  pleated: '플리티드: 규칙적인 주름이 잡힌 스커트. 단정하고 구조적인 느낌.',
  tiered: '티어드: 여러 층이 겹쳐진 계단식 스커트. 볼륨감과 동화적인 느낌.',
  layeredTulle: '레이어드 튤: 여러 겹의 튤 소재가 겹쳐진 스커트. 공주 같은 풍성한 볼륨.',
  ruffled: '러플: 물결치는 러플 장식이 달린 스커트. 화려하고 여성스러운 느낌.',
  ruched: '루칭: 소재를 당겨 만든 주름 장식. 입체적이고 독특한 텍스처.',
  asymmetricDrape: '비대칭 드레이프: 한쪽이 높거나 낮게 흘러내리는 비대칭 형태. 모던하고 아트적인 스타일.',
};

export const TRAIN_GLOSSARY: Record<TrainLength, string> = {
  none: '트레인 없음: 뒤에 끌리는 부분 없음. 실용적이고 활동하기 편함.',
  sweep: '스윕 트레인: 바닥에서 약 15-30cm 끌리는 가장 짧은 트레인. 우아하면서도 실용적.',
  court: '코트 트레인: 바닥에서 약 30-45cm 끌리는 중간 길이 트레인. 세미 포멀 웨딩에 적합.',
  chapel: '채플 트레인: 바닥에서 약 90-120cm 끌리는 트레인. 로맨틱하고 포멀한 느낌.',
  cathedral: '캐시드럴 트레인: 바닥에서 약 240-270cm 끌리는 가장 긴 트레인. 매우 화려하고 격식 있는 드레스.',
};

export const FABRIC_GLOSSARY: Record<FabricType, string> = {
  satin: '새틴: 매끄럽고 광택 있는 소재. 클래식하고 우아한 웨딩 드레스의 대표 소재. 실루엣이 잘 표현됨.',
  mikado: '미카도: 두껍고 탄탄한 실크 소재. 구조적인 실루엣을 만들기 좋고 광택이 아름다움.',
  organza: '오간자: 얇고 반투명한 고급 소재. 볼륨과 레이어드 효과를 낼 수 있음. 가볍고 우아한 느낌.',
  tulle: '튤: 매우 얇고 그물망처럼 가벼운 소재. 볼륨감 있는 스커트에 많이 사용. 발레 같은 느낌.',
  lace: '레이스: 섬세한 패턴의 소재. 로맨틱하고 클래식한 웨딩 드레스의 전통적인 소재.',
  chiffon: '시폰: 얇고 부드러운 반투명 소재. 흘러내리는 드레이프가 아름답고 보헤미안한 느낌.',
  taffeta: '태피타: 바스락거리는 질감의 소재. 볼륨감과 구조감이 있으며 빈티지한 느낌.',
};

export const EMBELLISHMENT_GLOSSARY: Record<EmbellishmentType, string> = {
  beads: '비즈: 작은 구슬 장식. 은은한 광택과 섬세한 텍스처를 더함.',
  laceApplique: '레이스 아플리케: 별도의 레이스 조각을 드레스 위에 부착한 장식. 입체적이고 화려한 느낌.',
  threeDFlorals: '3D 플로럴: 입체적인 꽃 장식. 드라마틱하고 로맨틱한 느낌. 사진에서 매우 아름다움.',
  crystals: '크리스탈: 수정 장식. 빛을 받으면 반짝이는 화려한 효과. 럭셔리한 느낌.',
  pearls: '진주: 진주 장식. 클래식하고 우아한 느낌. 전통적인 웨딩의 분위기.',
  embroidery: '자수: 실로 수놓은 패턴 장식. 섬세하고 예술적인 느낌. 전통적인 공예 기법.',
  sequins: '스팽글: 작은 반짝이는 원형 조각. 파티나 이브닝 웨딩에 어울리는 화려한 장식.',
  ribbons: '리본: 리본 장식. 귀엽고 로맨틱한 포인트.',
  decorativeButtons: '장식 버튼: 장식용 버튼. 주로 등 부분에 줄지어 달려 클래식하고 로맨틱한 디테일.',
};

export const VEIL_LENGTH_GLOSSARY: Record<VeilLength, string> = {
  none: '베일 없음: 베일을 착용하지 않는 스타일.',
  blusher: '블러셔: 얼굴을 덮는 짧은 베일. 전통적인 버진 로드 의식에 사용.',
  elbow: '엘보 베일: 팔꿈치 길이의 베일. 짧고 귀여운 느낌.',
  fingertip: '핑거팁 베일: 손끝 길이의 베일. 가장 일반적으로 많이 선택하는 길이.',
  waltz: '왈츠 베일: 발목과 바닥 사이 길이의 베일. 우아하고 낭만적인 느낌.',
  chapel: '채플 베일: 채플 트레인 정도 길이의 베일. 포멀하고 우아한 스타일.',
  cathedral: '캐시드럴 베일: 캐시드럴 트레인 길이의 매우 긴 베일. 가장 화려하고 드라마틱한 스타일.',
};

export const VEIL_EDGE_GLOSSARY: Record<VeilEdge, string> = {
  cut: '컷 엣지: 깔끔하게 자른 단순한 마감. 모던하고 심플한 스타일.',
  ribbon: '리본 엣지: 얇은 리본으로 마감한 베일. 깔끔하고 우아한 느낌.',
  beaded: '비딩 엣지: 비즈로 장식한 가장자리. 화려하고 눈에 띄는 포인트.',
  lace: '레이스 엣지: 레이스로 장식한 가장자리. 로맨틱하고 전통적인 느낌.',
};

export const ACCESSORY_GLOSSARY: Record<AccessoryType, string> = {
  none: '장식 없음: 헤어 액세서리 없이 자연스러운 스타일.',
  tiara: '티아라: 왕관 모양의 헤어 액세서리. 공주 같은 화려하고 격식 있는 스타일.',
  headband: '헤드밴드: 머리를 두르는 밴드형 액세서리. 심플하고 세련된 느낌.',
  hairVine: '헤어 바인: 넝쿨처럼 생긴 유연한 헤어 액세서리. 보헤미안하고 자연스러운 느낌.',
  hairComb: '헤어 콤: 머리에 꽂는 빗 모양의 장식. 심플하고 우아한 포인트.',
  floralCrown: '플로럴 크라운: 꽃으로 만든 화관. 자연스럽고 낭만적인 느낌. 야외 웨딩에 잘 어울림.',
};

// ── Short (≤25 chars) Korean descriptions for always-visible chip labels ──────

export const SILHOUETTE_SHORT: Record<SilhouetteType, string> = {
  aline: '어깨부터 직선, 허리 아래로 퍼짐',
  mermaid: '무릎까지 fit, 무릎부터 크게 퍼짐',
  trumpet: '허벅지 중간까지 fit, 부드럽게 퍼짐',
  princess: '허리부터 자연스럽게 퍼짐',
  sheath: '직선 컬럼, 좁고 매끈',
  empire: '가슴 아래 절개, 흘러내림',
  fitFlare: '허리까지 fit, 살짝 퍼짐',
  tealength: '종아리 중간 길이 A라인',
  mini: '무릎 위 짧은 길이',
};

export const NECKLINE_SHORT: Record<NecklineType, string> = {
  sweetheart: '하트 모양 가슴 라인',
  vRegular: '보통 깊이 V',
  vDeep: '깊은 V',
  vPlunging: '매우 깊은 V (가슴 아래까지)',
  halter: '뒤로 묶는 끈, 어깨 노출',
  offShoulder: '어깨 살짝 아래',
  oneShoulder: '한쪽 어깨만',
  strapless: '끈 없음, 가슴 일자',
  boat: '쇄골 위 가로 라인',
  illusionCrew: '시스루로 목까지',
  square: '사각형',
  scoop: '둥근 U자',
  portrait: '어깨 양쪽 가로 넓게',
  highNeck: '목까지 올라옴',
  keyhole: '가슴 중앙에 열린 슬롯',
};

export const SLEEVE_SHORT: Record<SleeveType, string> = {
  sleeveless: '소매 없음',
  cap: '어깨 살짝 덮는 짧은 소매',
  short: '팔꿈치 위 짧은 소매',
  threeQuarter: '팔꿈치와 손목 사이 길이',
  long: '손목까지 긴 소매',
  bishop: '손목에서 퍼프, 커프스로 좁아짐',
  puff: '어깨 부분 부풀어 오름',
  bell: '종 모양으로 넓게 퍼짐',
  legOfMutton: '어깨 부풀고 팔꿈치 아래 타이트',
  illusion: '시스루 소재, 피부 비침',
};

export const SLEEVE_MATERIAL_SHORT: Record<SleeveMaterial, string> = {
  opaque: '불투명 소재',
  sheer: '반투명 시폰·오간자',
  lace: '레이스 소재',
  beaded: '비즈 장식',
};

export const WAIST_POSITION_SHORT: Record<WaistPosition, string> = {
  natural: '실제 허리선 위치',
  empire: '가슴 바로 아래 높은 위치',
  basque: 'V자로 앞쪽이 뾰족하게 내려옴',
  drop: '엉덩이 쪽으로 낮게 내려옴',
  asymmetric: '한쪽으로 기울어진 비대칭',
};

export const BODICE_STRUCTURE_SHORT: Record<BodiceStructure, string> = {
  corset: '강하게 조이는 구조적 보디스',
  softFit: '부드럽게 몸에 맞는 형태',
  peplum: '허리 아래 작은 플레어 러플',
  mockPeplum: '페플럼 효과, 별도 레이어 없음',
};

export const WAIST_ACCENT_SHORT: Record<WaistAccent, string> = {
  none: '허리 장식 없음',
  sash: '허리 두르는 넓은 띠',
  ribbon: '허리에 묶는 리본',
  brooch: '허리 포인트 장식 핀',
  beadedBand: '비즈 장식 허리 밴드',
};

export const BACK_SHORT: Record<BackType, string> = {
  closed: '등 전체 덮임',
  vBack: '등쪽 V자 파임',
  illusionBack: '시스루로 등 비침',
  openBack: '등이 크게 드러남',
  keyhole: '열쇠구멍 형태 개방부',
  buttonRow: '등 중앙에 버튼 줄',
  laceUpCorset: '끈으로 조여 맬 수 있음',
  drape: '등에 부드럽게 흘러내리는 드레이프',
};

export const SKIRT_TEXTURE_SHORT: Record<SkirtTexture, string> = {
  smooth: '매끈한 표면',
  gathered: '주름 모아 볼륨 만들기',
  pleated: '규칙적인 주름',
  tiered: '여러 층 계단식',
  layeredTulle: '여러 겹 튤 레이어',
  ruffled: '물결치는 러플 장식',
  ruched: '당겨서 만든 주름 장식',
  asymmetricDrape: '비대칭으로 흘러내림',
};

export const SLIT_SHORT: Record<SlitType, string> = {
  none: '슬릿 없음',
  side: '옆면 슬릿',
  front: '앞면 슬릿',
};

export const TRAIN_SHORT: Record<TrainLength, string> = {
  none: '트레인 없음',
  sweep: '약 15-30cm 끌림',
  court: '약 30-45cm 끌림',
  chapel: '약 90-120cm 끌림',
  cathedral: '약 240cm+ 끌림',
};

export const FABRIC_SHORT: Record<FabricType, string> = {
  satin: '매끄럽고 광택 있음',
  mikado: '두껍고 탄탄한 실크',
  organza: '얇고 반투명한 고급 소재',
  tulle: '매우 얇은 그물망 소재',
  lace: '섬세한 패턴의 소재',
  chiffon: '얇고 부드러운 반투명',
  taffeta: '바스락거리는 질감',
};

export const COLOR_SHORT: Record<ColorEnum, string> = {
  pureWhite: '순수한 하얀색',
  offWhite: '약간 따뜻한 화이트',
  ivory: '따뜻한 크림빛',
  champagne: '골드빛 베이지',
  blush: '연한 핑크',
  gold: '황금빛',
  grey: '우아한 회색',
  blue: '은은한 하늘빛',
  black: '블랙',
};

export const EMBELLISHMENT_SHORT: Record<EmbellishmentType, string> = {
  beads: '작은 구슬 장식',
  laceApplique: '레이스 조각 부착 장식',
  threeDFlorals: '입체 꽃 장식',
  crystals: '수정 반짝이 장식',
  pearls: '진주 장식',
  embroidery: '실로 수놓은 패턴',
  sequins: '작은 반짝이 원형',
  ribbons: '리본 장식',
  decorativeButtons: '장식용 버튼',
};

export const VEIL_LENGTH_SHORT: Record<VeilLength, string> = {
  none: '베일 없음',
  blusher: '얼굴 덮는 짧은 베일',
  elbow: '팔꿈치 길이',
  fingertip: '손끝 길이',
  waltz: '발목과 바닥 사이',
  chapel: '채플 트레인 정도',
  cathedral: '매우 긴 베일',
};

export const VEIL_EDGE_SHORT: Record<VeilEdge, string> = {
  cut: '깔끔하게 자른 단순 마감',
  ribbon: '얇은 리본으로 마감',
  beaded: '비즈 장식 가장자리',
  lace: '레이스 장식 가장자리',
};

export const ACCESSORY_SHORT: Record<AccessoryType, string> = {
  none: '헤어 액세서리 없음',
  tiara: '왕관 모양 액세서리',
  headband: '머리 두르는 밴드',
  hairVine: '넝쿨 모양 헤어 장식',
  hairComb: '빗 모양 장식',
  floralCrown: '꽃으로 만든 화관',
};
