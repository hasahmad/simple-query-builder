# simple-query-builder

Learning to build a simple query builder in Typescript

# Check examples.ts

```
import { Where } from './builder';
import QueryBuilder from './QueryBuilder';

const query = QueryBuilder
  .select(["r.role_id", {'num': "count(*)"}])
  .from({ 'u': 'users' })
  .from({ 'ur': 'user_roles' })
  .from({
    'up': QueryBuilder
      .select()
      .from({'p': 'permissions'})
      .where('p.removed_at', 'IS', 'null')
  })
  .join({'con': 'contacts'}, 'con.contact_id = u.contact_id')
  .joinLeft({'c': 'companies'}, [
    new Where('c.company_id', '=', 'u.company_id', 'AND', true),
    new Where('c.parent_type', '=', 'TENANT', 'AND'),
  ])
  .where('u.user_id', '=', 'ur.user_id', true)
  .where('u.user_id', '=', 'up.user_id', true)
  .orWhere('u.role_id', 'IN', QueryBuilder
    .select(["r.role_id"])
    .from({'r': 'roles'})
    .where('r.removed_at', 'IS NULL')
  )
  .where('u.username', 'IS NOT NULL')
  .where('u.username', 'LIKE', '%admin%')
  .where('u.created_at', 'BETWEEN', [
    new Date(2021, 0, 1), new Date(2022, 0, 9)
  ])
  .where('u.updated_at', '>', new Date(2021, 10, 1))
  .order(['u.user_id'])
  .group(['r.role_id'])
  .having('count(*)', '>=', 1)
  .explain();

console.log(query.build());
/**
 * Output:
 * 
 * EXPLAIN SELECT r.role_id, count(*) AS num FROM users AS u, user_roles AS ur, (SELECT * FROM permissions AS p WHERE (p.removed_at IS NULL)) AS up INNER JOIN contacts AS con ON con.contact_id = u.contact_id LEFT JOIN companies AS c ON ((c.company_id = u.company_id) AND (c.parent_type = 'TENANT')) WHERE (u.user_id = ur.user_id) AND (u.user_id = up.user_id) OR u.role_id IN (SELECT r.role_id FROM roles AS r WHERE r.removed_at IS NULL) AND u.username IS NOT NULL AND u.username LIKE '%admin%' AND u.created_at BETWEEN '2021-01-01T05:00:00.000Z' AND '2022-01-09T05:00:00.000Z' AND (u.updated_at > '2021-11-01T04:00:00.000Z') GROUP BY r.role_id HAVING (count(*) >= 1) ORDER BY u.user_id
 */

****************************************************************************************************

const insertQuery = QueryBuilder
  .insert('users')
  .data([
    {
      user_id: 100,
      username: 'user100',
      email: 'user100@gmail.com',
      password: 'SOME HASH',
    },
    {
      user_id: 101,
      username: 'user101',
      email: 'user101@gmail.com',
      password: 'SOME HASH',
    },
  ])
  .join({'ur': 'user_roles'}, 'ur.user_id = users.user_id')
  .where('users.user_id', '>=', 20)
  .where('ur.role_id', '=', 15);

console.log(insertQuery.build());
/**
 * Output:
 * 
 * INSERT INTO users (user_id, username, email, password) VALUES (100,'user100','user100@gmail.com','SOME HASH'), (101,'user101','user101@gmail.com','SOME HASH') INNER JOIN user_roles AS ur ON ur.user_id = users.user_id WHERE (users.user_id >= 20) AND (ur.role_id = 15)
 */

****************************************************************************************************

const updateQuery = QueryBuilder
  .update('users')
  .set('users.removed_at', new Date(2022, 0, 8))
  .join({'ur': 'user_roles'}, 'ur.user_id = users.user_id')
  .where('users.user_id', '>=', 20)
  .where('ur.role_id', '=', 15);

console.log(updateQuery.build());
/**
 * Output:
 * 
 * UPDATE users SET users.removed_at = '2022-01-08T05:00:00.000Z' INNER JOIN user_roles AS ur ON ur.user_id = users.user_id WHERE (users.user_id >= 20) AND (ur.role_id = 15)
 */

****************************************************************************************************

const deleteQuery = QueryBuilder
  .delete('users')
  .join({'ur': 'user_roles'}, 'ur.user_id = users.user_id')
  .where('users.user_id', '>=', 20)
  .where('ur.role_id', '=', 15);

console.log(deleteQuery.build());
/**
 * Output:
 * 
 * DELETE FROM users INNER JOIN user_roles AS ur ON ur.user_id = users.user_id WHERE (users.user_id >= 20) AND (ur.role_id = 15)
 */

```
