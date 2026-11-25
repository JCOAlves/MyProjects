import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const report = fileURLToPath(new URL('../test-results/unit.json', import.meta.url));
const cli = fileURLToPath(new URL('../node_modules/@angular/cli/bin/ng.js', import.meta.url));
mkdirSync(dirname(report), { recursive: true });
rmSync(report, { force: true });
const result = spawnSync(
  process.execPath,
  [
    cli,
    'test',
    '--watch=false',
    ...process.argv.slice(2),
    '--reporters=json',
    '--output-file=' + report,
  ],
  { cwd: root, stdio: 'inherit' },
);
if (result.error || result.status !== 0) {
  console.error('Não foi possível concluir os testes.', result.error?.message || '');
  process.exit(result.status || 1);
}
try {
  const summary = JSON.parse(readFileSync(report, 'utf8'));
  console.log(
    `Testes: ${summary.numPassedTests}/${summary.numTotalTests} aprovados; ${summary.numFailedTests} falhas; ${summary.testResults.length} arquivos.`,
  );
  if (!summary.success || !summary.numTotalTests || summary.numFailedTests) process.exit(1);
} catch (error) {
  console.error('O runner não produziu um relatório válido:', error.message);
  process.exit(1);
}
