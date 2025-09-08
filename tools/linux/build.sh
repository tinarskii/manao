bun build --target=bun-windows-x64 --compile ./index.ts --outfile ./bin/windows/ManaoBot-windows-x64
bun build --target=bun-linux-x64 --compile ./index.ts --outfile ./bin/linux/ManaoBot-linux-x64
bun build --target=bun-mac-x64 --compile ./index.ts --outfile ./bin/mac/ManaoBot-mac-x64
bun build --target=bun-linux-arm64 --compile ./index.ts --outfile ./bin/linux/ManaoBot-linux-arm64
bun build --target=bun-mac-arm64 --compile ./index.ts --outfile ./bin/mac/ManaoBot-mac-arm64

echo "[Build] Complete building ManaoBot binaries."

bun build --target=bun-windows-x64 --compile ./tools/setup.ts --outfile ./bin/windows/ManaoSetup-windows-x64
bun build --target=bun-linux-x64 --compile ./tools/setup.ts --outfile ./bin/linux/ManaoSetup-linux-x64
bun build --target=bun-mac-x64 --compile ./tools/setup.ts --outfile ./bin/mac/ManaoSetup-mac-x64
bun build --target=bun-linux-arm64 --compile ./tools/setup.ts --outfile ./bin/linux/ManaoSetup-linux-arm64
bun build --target=bun-mac-arm64 --compile ./tools/setup.ts --outfile ./bin/mac/ManaoSetup-mac-arm64

echo "[Build] Complete building ManaoSetup binaries."