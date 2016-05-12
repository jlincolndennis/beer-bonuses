
exports.seed = function(knex, Promise) {
  return Promise.join(
    // Deletes ALL existing entries
    knex('users').del(),

    // Inserts seed entries
    knex('users')
      .insert({email: 'user1@example.com',
              name: 'Dwayne The Rock Johnson',
              password_hash: 'password'})
  );
};
