import { 
  IAMClient, 
  ListAttachedUserPoliciesCommand, 
  ListGroupsForUserCommand, 
  ListUserPoliciesCommand, 
  type ListAttachedUserPoliciesCommandInput, 
  type ListGroupsForUserCommandInput, 
  type ListUserPoliciesCommandInput
} from '@aws-sdk/client-iam';

// list user policies
// list user attached policies
// list user groups

async function listUserPolicyNames(
  client: IAMClient,
  userName: string
): Promise<string[] | undefined> {
  const input: ListUserPoliciesCommandInput = { UserName: userName };
  const command = new ListUserPoliciesCommand(input);
  const response = await client.send(command);
  return response.PolicyNames;
}

async function listAttachedUserPolicyNames(
  client: IAMClient,
  userName: string
): Promise<(string | undefined)[] | undefined> {
  const input: ListAttachedUserPoliciesCommandInput = { UserName: userName };
  const command = new ListAttachedUserPoliciesCommand(input);
  const response = await client.send(command);
  return response.AttachedPolicies?.map(policy => policy.PolicyName);
}

async function listGroupNamesForUser(
  client: IAMClient,
  userName: string
): Promise<(string | undefined)[] | undefined> {
  const input: ListGroupsForUserCommandInput = { UserName: userName };
  const command = new ListGroupsForUserCommand(input);
  const response = await client.send(command);
  return response.Groups?.map(group => group.GroupName);
}

async function main() {
  const client = new IAMClient();

  // const policyNames = await listUserPolicyNames(client, 'foo')
  // console.log(policyNames);

  const policyNames = await listAttachedUserPolicyNames(client, 'foo')
  console.log(policyNames);

  // const groups = await listGroupNamesForUser(client, 'foo');
  // console.log(groups);
}

main();