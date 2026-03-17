-- ============================================
-- Миграция данных для metall_lider_v2
-- Выполнить ПОСЛЕ prisma db push на сервере
-- ============================================

BEGIN;

-- 1. Удаляем старые данные атрибутов
DELETE FROM product_attributes;
DELETE FROM attributes;
DELETE FROM attribute_groups;

-- 2. Создаём группы
INSERT INTO attribute_groups (id, name, "sortOrder") VALUES
  ('grp_prof_tube', 'Труба профильная', 1),
  ('grp_round_tube', 'Труба круглая', 2),
  ('grp_rebar', 'Арматура', 3),
  ('grp_angle', 'Уголок', 4),
  ('grp_beam', 'Швеллер / Балка', 5),
  ('grp_profnastil', 'Профнастил', 6),
  ('grp_wire', 'Проволока', 7),
  ('grp_hardware', 'Метизы и фурнитура', 8);

-- 3. Общие атрибуты (без группы)
INSERT INTO attributes (id, name, key, type, unit, "sortOrder", "isFilter", "groupId") VALUES
  ('attr_thickness',    'Толщина',       'thickness',    'NUMBER', 'мм',  1, true, NULL),
  ('attr_length',       'Длина',         'length',       'NUMBER', 'м',   2, true, NULL),
  ('attr_width',        'Ширина',        'width',        'NUMBER', 'мм',  3, true, NULL),
  ('attr_diameter',     'Диаметр',       'diameter',     'NUMBER', 'мм',  4, true, NULL),
  ('attr_steel',        'Марка стали',   'steel_grade',  'STRING', NULL,  5, true, NULL),
  ('attr_manufacturer', 'Производитель', 'manufacturer', 'STRING', NULL,  6, true, NULL),
  ('attr_weight',       'Вес п.м.',      'weight_pm',    'NUMBER', 'кг',  7, true, NULL);

-- 4. Труба профильная
INSERT INTO attributes (id, name, key, type, unit, "sortOrder", "isFilter", "groupId") VALUES
  ('attr_prof_h', 'Высота профиля (A)', 'prof_height', 'NUMBER', 'мм', 1, true, 'grp_prof_tube'),
  ('attr_prof_w', 'Ширина профиля (B)', 'prof_width',  'NUMBER', 'мм', 2, true, 'grp_prof_tube');

-- 5. Труба круглая
INSERT INTO attributes (id, name, key, type, unit, "sortOrder", "isFilter", "groupId") VALUES
  ('attr_pipe_id', 'Внутренний диаметр',   'pipe_id', 'NUMBER', 'мм', 1, true, 'grp_round_tube'),
  ('attr_pipe_dn', 'Условный проход (Ду)', 'pipe_dn', 'NUMBER', 'мм', 2, true, 'grp_round_tube');

-- 6. Арматура
INSERT INTO attributes (id, name, key, type, unit, "sortOrder", "isFilter", "groupId") VALUES
  ('attr_arm_class', 'Класс арматуры', 'arm_class', 'STRING', NULL, 1, true, 'grp_rebar');

-- 7. Уголок
INSERT INTO attributes (id, name, key, type, unit, "sortOrder", "isFilter", "groupId") VALUES
  ('attr_ugol_a', 'Полка A', 'ugol_a', 'NUMBER', 'мм', 1, true, 'grp_angle'),
  ('attr_ugol_b', 'Полка B', 'ugol_b', 'NUMBER', 'мм', 2, true, 'grp_angle');

-- 8. Швеллер / Балка
INSERT INTO attributes (id, name, key, type, unit, "sortOrder", "isFilter", "groupId") VALUES
  ('attr_beam_num',    'Номер профиля', 'beam_number', 'NUMBER', NULL,  1, true, 'grp_beam'),
  ('attr_beam_flange', 'Ширина полки',  'beam_flange', 'NUMBER', 'мм', 2, true, 'grp_beam');

-- 9. Профнастил
INSERT INTO attributes (id, name, key, type, unit, "sortOrder", "isFilter", "groupId") VALUES
  ('attr_pn_mark',  'Марка профиля',  'pn_mark',       'STRING', NULL,  1, true, 'grp_profnastil'),
  ('attr_pn_wave',  'Высота волны',   'pn_wave',       'NUMBER', 'мм', 2, true, 'grp_profnastil'),
  ('attr_pn_ww',    'Рабочая ширина', 'pn_work_width', 'NUMBER', 'мм', 3, true, 'grp_profnastil'),
  ('attr_pn_color', 'Цвет RAL',       'pn_color',      'COLOR',  NULL,  4, true, 'grp_profnastil');

-- 10. Проволока
INSERT INTO attributes (id, name, key, type, unit, "sortOrder", "isFilter", "groupId") VALUES
  ('attr_wire_coat', 'Тип покрытия', 'wire_coating', 'STRING', NULL, 1, true, 'grp_wire');

-- 11. Метизы
INSERT INTO attributes (id, name, key, type, unit, "sortOrder", "isFilter", "groupId") VALUES
  ('attr_met_type', 'Тип', 'met_type', 'STRING', NULL, 1, true, 'grp_hardware');

-- 12. Маппинг oldId (старые ID → новые товары для 301 редиректов)
-- 158 товаров для маппинга oldId
UPDATE products SET "oldId" = 11 WHERE id = 'cmmjes1il000zkslhagnhj1m9';
UPDATE products SET "oldId" = 13 WHERE id = 'cmmjes1uy007bkslhi84a5s98';
UPDATE products SET "oldId" = 14 WHERE id = 'cmmjes1ux007akslhi91b61ab';
UPDATE products SET "oldId" = 15 WHERE id = 'cmmjes1vn007jkslhmvjndopu';
UPDATE products SET "oldId" = 16 WHERE id = 'cmmjes1vi007hkslht5hs4yq3';
UPDATE products SET "oldId" = 17 WHERE id = 'cmmjes1vh007gkslhuzly423s';
UPDATE products SET "oldId" = 18 WHERE id = 'cmmjes1uz007dkslhhlzs3cj5';
UPDATE products SET "oldId" = 19 WHERE id = 'cmmjes1v0007ekslhrzs1l9xq';
UPDATE products SET "oldId" = 20 WHERE id = 'cmmjes1xk008skslh3m80ekbk';
UPDATE products SET "oldId" = 21 WHERE id = 'cmmjes1xj008rkslhen9u1dv9';
UPDATE products SET "oldId" = 22 WHERE id = 'cmmjes1xi008qkslhtb90aiyy';
UPDATE products SET "oldId" = 23 WHERE id = 'cmmjes1xh008pkslhuzesi5ng';
UPDATE products SET "oldId" = 24 WHERE id = 'cmmjes1xl008ukslhkkhgny5d';
UPDATE products SET "oldId" = 25 WHERE id = 'cmmjes1xo008vkslhnb1bb3i6';
UPDATE products SET "oldId" = 26 WHERE id = 'cmmjes1xp008wkslhj6773pm6';
UPDATE products SET "oldId" = 27 WHERE id = 'cmmjes1xl008tkslheifovegp';
UPDATE products SET "oldId" = 28 WHERE id = 'cmmjes1ib000skslhm1fqgphv';
UPDATE products SET "oldId" = 29 WHERE id = 'cmmjes1ij000xkslhetcsnnfh';
UPDATE products SET "oldId" = 30 WHERE id = 'cmmjes1i9000qkslhv301qizj';
UPDATE products SET "oldId" = 31 WHERE id = 'cmmjes1i8000pkslh94zyfq9g';
UPDATE products SET "oldId" = 32 WHERE id = 'cmmjes1ie000ukslh1od47s4o';
UPDATE products SET "oldId" = 33 WHERE id = 'cmmjes1ne004hkslhx6ycma09';
UPDATE products SET "oldId" = 34 WHERE id = 'cmmjes1ng004jkslhusabbtpk';
UPDATE products SET "oldId" = 35 WHERE id = 'cmmjes1ne004ikslhxwwmytw6';
UPDATE products SET "oldId" = 36 WHERE id = 'cmmjes1nt004vkslhlj7l5cjo';
UPDATE products SET "oldId" = 37 WHERE id = 'cmmjes1ns004ukslhp7vvxkp4';
UPDATE products SET "oldId" = 38 WHERE id = 'cmmjes1nq004tkslh892km6dr';
UPDATE products SET "oldId" = 39 WHERE id = 'cmmjes1np004skslh7a4v0ma3';
UPDATE products SET "oldId" = 40 WHERE id = 'cmmjes1no004rkslhtw1k87bb';
UPDATE products SET "oldId" = 41 WHERE id = 'cmmjes1no004qkslhsrsocomw';
UPDATE products SET "oldId" = 42 WHERE id = 'cmmjes1nm004pkslhbnbim1rs';
UPDATE products SET "oldId" = 43 WHERE id = 'cmmjes1nl004okslhvkmnu3cg';
UPDATE products SET "oldId" = 44 WHERE id = 'cmmjes1nl004nkslhif3g7wzy';
UPDATE products SET "oldId" = 45 WHERE id = 'cmmjes1nj004mkslhtn08w3y3';
UPDATE products SET "oldId" = 46 WHERE id = 'cmmjes1ni004lkslhnd5lpdpy';
UPDATE products SET "oldId" = 47 WHERE id = 'cmmjes1y8009kkslhmax828wx';
UPDATE products SET "oldId" = 48 WHERE id = 'cmmjes1y7009jkslh0a9b5048';
UPDATE products SET "oldId" = 49 WHERE id = 'cmmjes1y6009ikslhrsbbn6q1';
UPDATE products SET "oldId" = 50 WHERE id = 'cmmjes1y5009hkslhxfo1ej8l';
UPDATE products SET "oldId" = 51 WHERE id = 'cmmjes1y5009gkslhwn2c7alb';
UPDATE products SET "oldId" = 52 WHERE id = 'cmmjes1y4009fkslh6v80i7t2';
UPDATE products SET "oldId" = 53 WHERE id = 'cmmjes1y3009ekslhcuq7q51f';
UPDATE products SET "oldId" = 54 WHERE id = 'cmmjes1ya009nkslhuq5aue1n';
UPDATE products SET "oldId" = 55 WHERE id = 'cmmjes1y9009mkslh9ucy42ze';
UPDATE products SET "oldId" = 56 WHERE id = 'cmmjes1y8009lkslh6ogcrpt6';
UPDATE products SET "oldId" = 57 WHERE id = 'cmmjes1xq008xkslh20l2gq0f';
UPDATE products SET "oldId" = 58 WHERE id = 'cmmjes1y2009ckslhjzm0ffqz';
UPDATE products SET "oldId" = 59 WHERE id = 'cmmjes1y1009bkslh2chwzsqx';
UPDATE products SET "oldId" = 60 WHERE id = 'cmmjes1xz009akslhioe5wlfa';
UPDATE products SET "oldId" = 61 WHERE id = 'cmmjes1xz0099kslhmh8lmuxt';
UPDATE products SET "oldId" = 62 WHERE id = 'cmmjes1xx0096kslhivsktb6v';
UPDATE products SET "oldId" = 63 WHERE id = 'cmmjes1xw0095kslhxdbra6h2';
UPDATE products SET "oldId" = 64 WHERE id = 'cmmjes1pt0068kslhfcswxhfn';
UPDATE products SET "oldId" = 65 WHERE id = 'cmmjes1ps0067kslhpm48tjs3';
UPDATE products SET "oldId" = 66 WHERE id = 'cmmjes1pr0066kslhsmnm4yi3';
UPDATE products SET "oldId" = 67 WHERE id = 'cmmjes1pq0065kslhw3hh4rp6';
UPDATE products SET "oldId" = 68 WHERE id = 'cmmjes1vr007lkslhy10728iu';
UPDATE products SET "oldId" = 69 WHERE id = 'cmmjes1vp007kkslha7xoatlz';
UPDATE products SET "oldId" = 70 WHERE id = 'cmmjes1th0076kslhj09smzq4';
UPDATE products SET "oldId" = 71 WHERE id = 'cmmjes1tf0075kslh0jsd71am';
UPDATE products SET "oldId" = 72 WHERE id = 'cmmjes1tc0074kslhh6wq6e87';
UPDATE products SET "oldId" = 73 WHERE id = 'cmmjes1xg008okslhbe3fdi7w';
UPDATE products SET "oldId" = 74 WHERE id = 'cmmjes1xf008nkslhfjruu3f1';
UPDATE products SET "oldId" = 75 WHERE id = 'cmmjes1y3009dkslh8b8opn7c';
UPDATE products SET "oldId" = 77 WHERE id = 'cmmjes1rt006tkslhcz3p5079';
UPDATE products SET "oldId" = 78 WHERE id = 'cmmjes1xf008mkslhsktsjna9';
UPDATE products SET "oldId" = 79 WHERE id = 'cmmjes1xc008kkslhhfp09scw';
UPDATE products SET "oldId" = 80 WHERE id = 'cmmjes1xc008jkslhvzdj1fnd';
UPDATE products SET "oldId" = 81 WHERE id = 'cmmjes1xb008ikslhpycjqbdd';
UPDATE products SET "oldId" = 82 WHERE id = 'cmmjes1st0073kslhmr0mak84';
UPDATE products SET "oldId" = 83 WHERE id = 'cmmjes1sl0071kslhh6c1ilzd';
UPDATE products SET "oldId" = 84 WHERE id = 'cmmjes1sj0070kslhb21vzgpw';
UPDATE products SET "oldId" = 85 WHERE id = 'cmmjes1sh006zkslh15jjk7lr';
UPDATE products SET "oldId" = 86 WHERE id = 'cmmjes1xa008hkslhqgwh7mu1';
UPDATE products SET "oldId" = 87 WHERE id = 'cmmjes1x8008fkslhd3rj5yue';
UPDATE products SET "oldId" = 88 WHERE id = 'cmmjes1x8008ekslhk6xl4fib';
UPDATE products SET "oldId" = 89 WHERE id = 'cmmjes1x7008dkslh53fys9y9';
UPDATE products SET "oldId" = 90 WHERE id = 'cmmjes1x6008ckslh2h8bghnq';
UPDATE products SET "oldId" = 91 WHERE id = 'cmmjes1x3008akslhicopoku1';
UPDATE products SET "oldId" = 92 WHERE id = 'cmmjes1x30089kslhj3e3wr74';
UPDATE products SET "oldId" = 93 WHERE id = 'cmmjes1x20088kslh9cml64k9';
UPDATE products SET "oldId" = 94 WHERE id = 'cmmjes1s8006xkslhwlxf4nuq';
UPDATE products SET "oldId" = 95 WHERE id = 'cmmjes1s0006vkslhjqu7ve0o';
UPDATE products SET "oldId" = 96 WHERE id = 'cmmjes1rx006ukslhplfv9m1p';
UPDATE products SET "oldId" = 97 WHERE id = 'cmmjes1x10087kslhqltvadu8';
UPDATE products SET "oldId" = 98 WHERE id = 'cmmjes1wz0085kslhhuw0jjhw';
UPDATE products SET "oldId" = 100 WHERE id = 'cmmjes1ww0082kslh6klscz46';
UPDATE products SET "oldId" = 101 WHERE id = 'cmmjes1rr006skslhzo5es6a3';
UPDATE products SET "oldId" = 102 WHERE id = 'cmmjes1rm006rkslhpq797is2';
UPDATE products SET "oldId" = 103 WHERE id = 'cmmjes1rj006qkslhunu4bugx';
UPDATE products SET "oldId" = 104 WHERE id = 'cmmjes1r5006okslhd5g9mdw4';
UPDATE products SET "oldId" = 105 WHERE id = 'cmmjes1wv0081kslh67df82uo';
UPDATE products SET "oldId" = 106 WHERE id = 'cmmjes1wu007zkslhp63r9ary';
UPDATE products SET "oldId" = 107 WHERE id = 'cmmjes1wo007vkslhxgn09f9z';
UPDATE products SET "oldId" = 108 WHERE id = 'cmmjes1wm007tkslh96lbo10n';
UPDATE products SET "oldId" = 109 WHERE id = 'cmmjes1r4006nkslhh4ucc9ut';
UPDATE products SET "oldId" = 110 WHERE id = 'cmmjes1qv006lkslhd8f2f5i8';
UPDATE products SET "oldId" = 111 WHERE id = 'cmmjes1q3006hkslhlne2fiit';
UPDATE products SET "oldId" = 112 WHERE id = 'cmmjes1q1006fkslhf5o5bvbv';
UPDATE products SET "oldId" = 113 WHERE id = 'cmmjes1i4000lkslhxco51090';
UPDATE products SET "oldId" = 116 WHERE id = 'cmmjes1xt0092kslhi9u7wvgr';
UPDATE products SET "oldId" = 117 WHERE id = 'cmmjes1xs0090kslh72mioi20';
UPDATE products SET "oldId" = 118 WHERE id = 'cmmjes1pu0069kslhw859tks5';
UPDATE products SET "oldId" = 121 WHERE id = 'cmmjes1py006bkslhrctu3kfu';
UPDATE products SET "oldId" = 122 WHERE id = 'cmmjes1q0006dkslhqozifcey';
UPDATE products SET "oldId" = 123 WHERE id = 'cmmjes1wk007rkslhoq8jqvyn';
UPDATE products SET "oldId" = 125 WHERE id = 'cmmjes1lb002nkslhyjdhfzeh';
UPDATE products SET "oldId" = 126 WHERE id = 'cmmjes1l3002dkslh8dselse2';
UPDATE products SET "oldId" = 127 WHERE id = 'cmmjes1l4002ekslhljup8d7d';
UPDATE products SET "oldId" = 128 WHERE id = 'cmmjes1l5002fkslh75wy6ply';
UPDATE products SET "oldId" = 129 WHERE id = 'cmmjes1l6002gkslhxvxjfco1';
UPDATE products SET "oldId" = 130 WHERE id = 'cmmjes1l6002hkslheqyw57cn';
UPDATE products SET "oldId" = 131 WHERE id = 'cmmjes1l7002ikslhvm5s6hns';
UPDATE products SET "oldId" = 132 WHERE id = 'cmmjes1jo001ekslhoifdvhmg';
UPDATE products SET "oldId" = 133 WHERE id = 'cmmjes1jq001fkslh2yjiwt3m';
UPDATE products SET "oldId" = 134 WHERE id = 'cmmjes1jr001gkslhl07ut2me';
UPDATE products SET "oldId" = 135 WHERE id = 'cmmjes1wy0084kslh42ki44ie';
UPDATE products SET "oldId" = 137 WHERE id = 'cmmjes1js001hkslhbol8if1y';
UPDATE products SET "oldId" = 138 WHERE id = 'cmmjes1jy001jkslh9372qa0q';
UPDATE products SET "oldId" = 139 WHERE id = 'cmmjes1jv001ikslh6u4dc8rj';
UPDATE products SET "oldId" = 140 WHERE id = 'cmmjes1kh001qkslh8te8u7gn';
UPDATE products SET "oldId" = 141 WHERE id = 'cmmjes1kg001pkslhtoiyrnic';
UPDATE products SET "oldId" = 142 WHERE id = 'cmmjes1ke001nkslhecrwfn5l';
UPDATE products SET "oldId" = 143 WHERE id = 'cmmjes1k1001lkslh87dzeye5';
UPDATE products SET "oldId" = 144 WHERE id = 'cmmjes1kf001okslhx3xqsc3p';
UPDATE products SET "oldId" = 145 WHERE id = 'cmmjes1kl001tkslhi55o8ufq';
UPDATE products SET "oldId" = 146 WHERE id = 'cmmjes1jn001dkslhlodqbj4d';
UPDATE products SET "oldId" = 147 WHERE id = 'cmmjes1jm001ckslh4hfvtban';
UPDATE products SET "oldId" = 148 WHERE id = 'cmmjes1k3001mkslhybkigs81';
UPDATE products SET "oldId" = 149 WHERE id = 'cmmjes1ok005ikslh1dl6k7rt';
UPDATE products SET "oldId" = 150 WHERE id = 'cmmjes1ol005jkslhg3tlim5t';
UPDATE products SET "oldId" = 151 WHERE id = 'cmmjes1ob005ckslhom04cknm';
UPDATE products SET "oldId" = 152 WHERE id = 'cmmjes1oc005dkslhvrm0fqkh';
UPDATE products SET "oldId" = 153 WHERE id = 'cmmjes1oe005ekslhd8w2phah';
UPDATE products SET "oldId" = 154 WHERE id = 'cmmjes1of005fkslh00gndrk1';
UPDATE products SET "oldId" = 155 WHERE id = 'cmmjes1oh005gkslhcadeu0i5';
UPDATE products SET "oldId" = 158 WHERE id = 'cmmjes1n20044kslhcar8knj6';
UPDATE products SET "oldId" = 159 WHERE id = 'cmmjes1n20045kslhmg6ht8k4';
UPDATE products SET "oldId" = 160 WHERE id = 'cmmjes1n30046kslhshaf62d9';
UPDATE products SET "oldId" = 165 WHERE id = 'cmmjes1o50056kslhfl6sdpuz';
UPDATE products SET "oldId" = 173 WHERE id = 'cmmjes1oz005tkslhdwv7nh8b';
UPDATE products SET "oldId" = 174 WHERE id = 'cmmjes1p0005vkslhmjdsj1a2';
UPDATE products SET "oldId" = 175 WHERE id = 'cmmjes1pj005zkslh7qjnj20u';
UPDATE products SET "oldId" = 176 WHERE id = 'cmmjes1pk0060kslh0a6nzvra';
UPDATE products SET "oldId" = 177 WHERE id = 'cmmjes1n50048kslh5xesxbfm';
UPDATE products SET "oldId" = 178 WHERE id = 'cmmjes1n40047kslhl34zd8nn';
UPDATE products SET "oldId" = 179 WHERE id = 'cmmjes1wh007okslhc6jists6';
UPDATE products SET "oldId" = 181 WHERE id = 'cmmjes1vs007mkslhq5fcjg1g';
UPDATE products SET "oldId" = 182 WHERE id = 'cmmjes1us0077kslhm4uz9f9v';
UPDATE products SET "oldId" = 183 WHERE id = 'cmmjes1wj007qkslha4d6pvzd';
UPDATE products SET "oldId" = 184 WHERE id = 'cmmjes1qp006kkslhgsxg7qb4';
UPDATE products SET "oldId" = 12 WHERE id = 'cmmjes1i2000jkslh05wr3130';  -- Арматура 6 → А500C ф 6
UPDATE products SET "oldId" = 76 WHERE id = 'cmmjes1ho000ekslh0xlxdmrs';  -- Арматура 10 → А500C ф 10
UPDATE products SET "oldId" = 114 WHERE id = 'cmmjes1hz000hkslhqx4mar70'; -- Арматура 16 → А500C ф 16
UPDATE products SET "oldId" = 115 WHERE id = 'cmmjes1hw000fkslh9nngs21j'; -- Арматура 12 → А500C ф 12
UPDATE products SET "oldId" = 119 WHERE id = 'cmmjes1i3000kkslh2j4a0rlc'; -- Арматура 8 → А500C ф 8
UPDATE products SET "oldId" = 120 WHERE id = 'cmmjes1i0000ikslhfomf7twd'; -- Арматура 18 → А500C ф 18
UPDATE products SET "oldId" = 180 WHERE id = 'cmmjes1hx000gkslh3v6ikl3g'; -- Арматура 14 → А500C ф 14

COMMIT;

-- Проверка
SELECT COUNT(*) as groups FROM attribute_groups;
SELECT COUNT(*) as attributes FROM attributes;
SELECT COUNT(*) as mapped FROM products WHERE "oldId" IS NOT NULL;
