import { 
  IAMClient, 
  ListGroupsForUserCommand, 
  type ListGroupsForUserRequest 
} from '@aws-sdk/client-iam';

// list user policies
// list user attached policies
// list user groups

async function listGroupNamesForUser(
  client: IAMClient,
  userName: string
) {
  const input: ListGroupsForUserRequest = {
    UserName: userName
  }
  const command = new ListGroupsForUserCommand(input);
  const response = await client.send(command);

  const groups = response['Groups'] ?? [];
  return groups.map(group => group.GroupName);
}

async function main() {
  const client = new IAMClient();
  const groups = await listGroupNamesForUser(client, 'foo');
  console.log(groups);
}

main();