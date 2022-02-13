import QueryBuilder from './QueryBuilder';
import { parseValue } from './utils';
import Where from './Where';

const membersSelect = QueryBuilder
    .select(['m.member_id'])
    .from({'m': 'members'})
    .where('m.member_id IN (?)', [1, 2, 3, 4])
    .where('m.active = ?', 1);

const query = QueryBuilder
    .select([
        'u.*',
        {'org_unit': 'o.name'},
        {'org_unit_id': 'o.id'},
        {'org_level': "concat(o.scope, '-', o.level)"},
    ])
    .from({'u': 'users'})
    .join({'o': 'org_units'}, 'o.org_unit_id = u.org_unit_id')
    .where(new Where('', 'u.active = ?', 1, false))
    .where('u.date_joined >= ?', new Date(2021, 1, 1, 1, 1, 1))
    .orWhere('o.member_id in ({{?}})', membersSelect)
    .groupBy(['m.member_id'])
    .having('count(o.name) > ?', 1234);

console.log(query.buildExpression());
/**
 * [
 *   "SELECT u.*, o.name as org_unit, o.id as org_unit_id, concat(o.scope, '-', o.level) as org_level FROM users as u INNER JOIN org_units as o ON o.org_unit_id = u.org_unit_id WHERE (u.active = ?) AND (u.date_joined >= ?) OR (o.member_id in (SELECT m.member_id FROM members as m  WHERE (m.member_id IN (?)) AND (m.active = ?))) GROUP BY m.member_id HAVING (count(o.name) > ?)",
 *   [ 1, 2021-02-01T06:01:01.000Z, [ 1, 2, 3, 4 ], 1, 1234 ]
 * ]
 */


console.log(
    QueryBuilder.select([
        'u.*',
        {'org_unit': 'o.name'},
        {'org_unit_id': 'o.id'},
        {'org_level': "concat(o.scope, '-', o.level)"},
    ]).explain(true).distinct(true).buildExpression()
);
/**
 * [
 *   "EXPLAIN DISTINCT SELECT u.*, o.name as org_unit, o.id as org_unit_id, concat(o.scope, '-', o.level) as org_level",
 *   []
 * ]
 */

console.log({
    1: parseValue(1),
    '2': parseValue('2'),
    'str': parseValue('str'),
    '[1,2,3,]': parseValue([1,2,3,]),
    '["he","ll","o",100,238]': parseValue(["he","ll","o",100,238]),
    '["he","ll","o",{value: 100, type: "string"},238]': parseValue(["he","ll","o",{value: 100, type: "string"},238]),
    'string with type array': parseValue('[1,2,3,]', false, 'array'),
})
/**
 * {
 *  '1': '1',
 *  '2': "'2'",
 *  str: "'str'",
 *  '[1,2,3,]': '1,2,3',
 *  '["he","ll","o",100,238]': "'he','ll','o',100,238",
 *  '["he","ll","o",{value: 100, type: "string"},238]': "'he','ll','o','100',238",
 *  'string with type array': '[1,2,3,]'
 * }
 */

 const insertQuery = QueryBuilder
 .insert('users', ['user_id', 'username', 'email'])
 .values([
     [1, 'user1', 'user1@gmail.com'],
     [2, 'user2', 'user2@gmail.com'],
     [3, 'user3', 'user3@gmail.com'],
     [4, 'user4', 'user4@gmail.com'],
 ])
 .join({'o': 'org_units'}, 'o.org_unit_id = u.org_unit_id')
 .where(new Where('', 'u.active = ?', 1, false))
 .where('u.date_joined >= ?', new Date(2021, 1, 1, 1, 1, 1))
 .orWhere('o.member_id in ({{?}})', membersSelect);

console.log(insertQuery.buildExpression());

const insertQuery2 = QueryBuilder
.insert('users', ['user_id', 'username', 'email'])
.values(membersSelect)
.join({'o': 'org_units'}, 'o.org_unit_id = u.org_unit_id')
.where(new Where('', 'u.active = ?', 1, false))
.where('u.date_joined >= ?', new Date(2021, 1, 1, 1, 1, 1));

console.log(insertQuery2.buildExpression());
