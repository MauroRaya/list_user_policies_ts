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
import { 
  createReadStream, 
  createWriteStream 
} from 'fs';
import { EOL } from 'os';
import readline from 'readline';

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
): Promise<string[]> {
  const input: ListAttachedUserPoliciesCommandInput = { UserName: userName };
  const command = new ListAttachedUserPoliciesCommand(input);
  const response = await client.send(command);

  const policies = response.AttachedPolicies ?? [];

  return policies
    .map(policy => policy.PolicyName)
    .filter(policyName => policyName !== undefined);
}

async function listGroupNamesForUser(
  client: IAMClient,
  userName: string
): Promise<string[]> {
  const input: ListGroupsForUserCommandInput = { UserName: userName };
  const command = new ListGroupsForUserCommand(input);
  const response = await client.send(command);

  const groups = response.Groups ?? [];

  return groups
    .map(group => group.GroupName)
    .filter(groupName => groupName !== undefined);
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
): Promise<string[]> {
  const input: ListAttachedGroupPoliciesCommandInput = { GroupName: groupName };
  const command = new ListAttachedGroupPoliciesCommand(input);
  const response = await client.send(command);

  const policies = response.AttachedPolicies ?? [];

  return policies
    .map(policy => policy.PolicyName)
    .filter(policyName => policyName !== undefined);
}

async function main() {
  const ignoreUsers = ['<root_account>'];
  const client = new IAMClient();

  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: npm start <input_csv_path> <output_csv_path>');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  if (!inputPath) {
    console.error('input path is required');
    process.exit(1);
  }
  if (!outputPath) {
    console.error('output path is required');
    process.exit(1);
  }

  const inputStream = createReadStream(inputPath);
  const rl = readline.createInterface({ 
    input: inputStream, 
    crlfDelay: Infinity 
  });

  const outputStream = createWriteStream(outputPath);

  let headers: string[] = [];
  let isFirstLine = true;

  for await (const line of rl) {
    if (isFirstLine) {
      headers = line.split(',');
      headers.push('policy_names', 'group_names', 'role_names');

      outputStream.write(headers.join(',') + EOL);

      isFirstLine = false;
      continue;
    }

    const row = line.split(',');
    const userIndex = headers.indexOf('user');
    if (userIndex === -1) throw new Error('CSV must have "user" column');

    const userName = row[userIndex];
    if (!userName || ignoreUsers.includes(userName)) continue;

    console.log(`Processing user ${userName}...`);

    const policyNames: string[] = [
      ...(await listUserPolicyNames(client, userName)),
      ...(await listAttachedUserPolicyNames(client, userName))
    ];

    const groupNames = await listGroupNamesForUser(client, userName);
    for (const groupName of groupNames) {
      policyNames.push(...await listGroupPolicyNames(client, groupName));
      policyNames.push(...await listAttachedGroupPolicyNames(client, groupName));
    }

    const newRow = [
      ...row,
      policyNames.join(";"),
      groupNames.join(";"),
      'no information'
    ];

    outputStream.write(newRow.join(",") + EOL);
  }

  outputStream.end();
  console.log(`CSV written to ${outputPath}`);
}

main();