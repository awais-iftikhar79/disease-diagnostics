import subprocess
import sys
import os

env = os.environ.copy()
env['PATH'] = "/home/awais-iftikhar/.nvm/versions/node/v26.2.0/bin:" + env.get('PATH', '')

try:
    result = subprocess.run(
        ['npm', 'install', '--no-audit', '--no-fund', '--loglevel=error'],
        cwd='/home/awais-iftikhar/Desktop/Disease_diagnostic/frontend',
        env=env,
        capture_output=True,
        text=True,
        check=True
    )
    print("STDOUT:", result.stdout)
    print("STDERR:", result.stderr)
except subprocess.CalledProcessError as e:
    print("Error during npm install")
    print("STDOUT:", e.stdout)
    print("STDERR:", e.stderr)
    sys.exit(1)
