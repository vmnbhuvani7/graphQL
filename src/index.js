const { ApolloServer, gql, PubSub } = require('apollo-server');

const typeDefs = gql`
    type Query {
        hello(name: String): String
        user: User
    }

    type User {
        id: ID!
        userName: String!
        firstLetter: String!
    }

    type Error {
        field: String!
        message: String!
    }

    type RegisterResponse {
        errors: [Error]
        user: User!
    }

    input userInfo { 
        userName:String!
        pwd:String!
    }

    type Mutation {
        register( userInfo: userInfo!): RegisterResponse!
        login( userInfo: userInfo!): String!
    }

    type Subscription {
        newUser: User!
    }
`;
const NEW_USER = "NEW_USER"
const resolvers = {
    Subscription: {
        newUser: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(NEW_USER)
        }
    },
    User: {
        firstLetter: parent => {
            return parent.userName[0]
        }
        // userName: (parent) => {
        //     console.log(parent);
        //     return "I am userName"
        // }
    },
    Query: {
        hello: (parent, { name }) => { return `hey ${name}` },
        user: () => ({
            id: 1,
            userName: "tom"
        })
    },
    Mutation: {
        // login: (parent, args, context, info) => {
        // return arg.userInfo.userName

        login: (parent, { userInfo: { userName } }, context, info) => {
            // console.log("context", context);
            return userName
        },
        register: (_, { userInfo: { userName } }, { pubsub }) => {
            const user = {
                id: 1,
                userName
            };

            pubsub.publish(NEW_USER, {
                newUser: user
            });

             return {
               errors: [
                    {
                        field: "username",
                        message: "bad"
                    },
                    {
                        field: "username2",
                        message: "bad2"
                    }
                ],
                user
            };
        }
    }
};

const pubsub = new PubSub();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ req, res, pubsub })
});

server.listen().then(({ url }) => console.log(`server started at ${url}`))