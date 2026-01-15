import { 
  IAMClient, 
  ListAttachedGroupPoliciesCommand, 
  ListAttachedUserPoliciesCommand, 
  ListGroupPoliciesCommand, 
  ListGroupsForUserCommand, 
  ListUserPoliciesCommand, 
  type ListAttachedGroupPoliciesCommandInput, 
  type ListAttachedUserPoliciesCommandInput, 
  type ListGroupPoliciesCommandInput, 
  type ListGroupsForUserCommandInput, 
  type ListUserPoliciesCommandInput
} from '@aws-sdk/client-iam';

async function listUserPolicyNames(
  client: IAMClient,
  userName: string
): Promise<string[]> {
  const input: ListUserPoliciesCommandInput = { UserName: userName };
  const command = new ListUserPoliciesCommand(input);
  const response = await client.send(command);
  return response.PolicyNames ?? [];
}

async function listAttachedUserPolicyNames(
  client: IAMClient,
  userName: string
): Promise<(string | undefined)[]> {
  const input: ListAttachedUserPoliciesCommandInput = { UserName: userName };
  const command = new ListAttachedUserPoliciesCommand(input);
  const response = await client.send(command);

  const policies = response.AttachedPolicies ?? [];
  return policies.map(policy => policy.PolicyName);
}

async function listGroupNamesForUser(
  client: IAMClient,
  userName: string
): Promise<(string | undefined)[]> {
  const input: ListGroupsForUserCommandInput = { UserName: userName };
  const command = new ListGroupsForUserCommand(input);
  const response = await client.send(command);

  const groups = response.Groups ?? [];
  return groups.map(group => group.GroupName);
}

async function listGroupPolicyNames(
  client: IAMClient,
  groupName: string
): Promise<string[]> {
  const input: ListGroupPoliciesCommandInput = { GroupName: groupName };
  const command = new ListGroupPoliciesCommand(input);
  const response = await client.send(command);
  return response.PolicyNames ?? [];
}

async function listAttachedGroupPolicyNames(
  client: IAMClient,
  groupName: string
): Promise<(string | undefined)[]> {
  const input: ListAttachedGroupPoliciesCommandInput = { GroupName: groupName };
  const command = new ListAttachedGroupPoliciesCommand(input);
  const response = await client.send(command);

  const policies = response.AttachedPolicies ?? [];
  return policies.map(policy => policy.PolicyName);
}

async function main() {
  const client = new IAMClient();
  const userName = 'foo';

  const policyNames = [];
  policyNames.push(...await listUserPolicyNames(client, userName));
  policyNames.push(...await listAttachedUserPolicyNames(client, userName));

  const groupNames = await listGroupNamesForUser(client, userName);

  for (const groupName of groupNames!) {
    policyNames.push(...await listGroupPolicyNames(client, groupName!));
    policyNames.push(...await listAttachedGroupPolicyNames(client, groupName!));
  }
}

main();