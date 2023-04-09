import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { getAccessToken } from "../auth";

const GRAPHQL_URL = "http://localhost:9000/graphql";

export const client = new ApolloClient({
  uri: GRAPHQL_URL,
  cache: new InMemoryCache(),
});

const JOB_DETAIL_FRAGMENT = gql`
  fragment JobDetail on Job {
    title
    company {
      id
      name
    }
    description
  }
`;

export const JOB_QUERY = gql`
  query jobQuery($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${JOB_DETAIL_FRAGMENT}
`;

export const JOBS_QUERY = gql`
  query JobQuery {
    jobs {
      id
      title
      company {
        id
        name
      }
    }
  }
`;

export const COMPANY_QUERY = gql`
  query getCompany($id: ID!) {
    company(id: $id) {
      id
      name
      description
      jobs {
        title
        description
      }
    }
  }
`;

export async function createJob(input) {
  const mutation = gql`
    mutation CreateJobMutation($input: CreateJobInput!) {
      job: createJob(input: $input) {
        ...JobDetail
      }
    }
    ${JOB_DETAIL_FRAGMENT}
  `;
  const variables = { input };
  // const headers = {
  //   Authorization: "Bearer " + getAccessToken(),
  // };
  const context = {
    headers: { Authorization: "Bearer " + getAccessToken() },
  };
  const {
    data: { job },
  } = client.mutate({
    mutation,
    variables,
    context,
    // result (the 2nd param in update) is equal to data: {job}
    update: (cache, { data: { job } }) => {
      cache.writeQuery({
        query: JOB_QUERY,
        variables: { id: job.id },
        data: { job },
      });
    },
  });
  console.log(job);
  return job;
}
