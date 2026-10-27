# Mobile2 client compatibility assessment

## Evidence collected

The supplied Mobile2Global folder contains an Unreal Engine-style layout:

- `Engine/Content/Paks/pakchunk0-WindowsNoEditor.pak` (36,675,915 bytes).
- Several `pakchunk*-WindowsNoEditor.sig` signature files, but only one corresponding `.pak` file was present in the file listing.
- CEF3 runtime files and language `.pak` files under `Engine/Binaries/ThirdParty/CEF3/Win64/Resources`; these are Chromium Embedded Framework resources, not evidence of Metin2 world assets.
- The reported executable `mobilemmo-Win64-Shipping.exe` contains strings referencing Unreal Engine 4.27 and Metin2-style data names such as `item_proto`, `mob_proto`, `skill_proto`, `m2data/warriorData.txt`, and a `.gr2` model name. It also references UE asset paths for Warrior/Warrior2, Sura/Sura2, Ninja/Ninja2 and Shaman/Shaman2 character classes, plus folders for mobs, mounts, sounds, item icons and effects. These are path/name references compiled into the executable, not extracted assets.

### PAK inspection

The local PAK file has a 36,675,915-byte length and a trailer containing the Unreal PAK magic value and version field. The footer reports an index offset of 36,537,246 and index size of 27,712 bytes. The byte immediately before the PAK magic is `0x01`, which is the PAK footer's encrypted-index flag. So the index is explicitly marked encrypted; this is stronger evidence than the unreadable bytes alone. The stored SHA-1 also does not match a direct hash of the apparent index region. The footer contains the compression-method label `Oodle`.

A direct string scan of the supplied PAK did not find plaintext names such as `m2data`, `item_proto`, or `mob_proto`. The executable additionally references expected data files including `box_proto.txt`, `item_list.txt`, `hair_data.txt`, `npclist.txt`, class-specific character data files, `item_names.txt`, `mob_names.txt`, `itemdesc.txt`, and locale text files. Their actual contents have not been located in the supplied files. This is consistent with an encrypted index and/or packed content, but it does not prove which assets are inside. The executable contains generic AES/decryption-related strings, but no usable key has been established. Do not infer a key or bypass client protections from those strings.

## Compatibility conclusion

Mobile2 is useful as a *reference for investigation*, but it is not currently a drop-in client or asset source for this Metin2 server:

- Unreal Engine PAK data cannot be copied directly into the classic Metin2 client.
- Unreal Engine runtime DLLs do not replace the classic client's Granny2 runtime.
- Names embedded in an executable only show that the program references those names; they do not prove the corresponding data files are available.
- The current server's data is maintained in its own formats under `src/core/infra/config/data/`, including `items.json` and `mobs.json`.

## Safe next steps

1. Continue server development independently of Mobile2.
2. If readable, lawfully usable exports of Mobile2's item/mob/skill tables become available, compare their schema and identifiers with the server's JSON data before importing anything.
3. Treat models, maps, textures, sounds, and client binaries as unavailable until their actual files, format, and redistribution rights are confirmed.
4. Keep the Windows client release disabled until a matching, complete runtime and game-data folder is available and the real client login path has been tested.

Do not mark Mobile2 asset reuse or classic-client compatibility as complete based only on executable strings or PAK signatures.

## Follow-up: what the encrypted-index flag means

The official Unreal Engine 4.27 documentation describes **Encrypt Pak Index** as preventing UnrealPak from opening, viewing, and unpacking a PAK index unless the required encryption key is supplied. It separately describes **Encrypt UAsset Files** and **Encrypt Assets**, so the encrypted-index flag alone does **not** prove that every payload asset is encrypted.

Official reference: https://dev.epicgames.com/documentation/unreal-engine/packaging-projects?application_version=4.27 (section “Signing and Encryption”).

### Practical next step

- If the project owner or authorized build environment can provide the matching PAK encryption key/configuration, use that with a compatible Unreal Engine 4.27 UnrealPak build and verify the archive against the tool output.
- If no authorized key/configuration is available, do not brute-force keys or attempt to defeat the protection. Continue with the already available executable metadata and independently sourced/exported game tables, or request an authorized export from the Mobile2 publisher/developer.
- The current supplied folder does not include UnrealPak.exe in the reported Engine binaries path. The UE prerequisites installer is not an archive extractor. No PAK files have been extracted yet, and no decryption key has been identified.
- Even if files can be extracted, their reuse in ASHEN REALM must be checked separately for permission and for format compatibility; UE assets are not directly interchangeable with the classic Metin2 client.

This narrows the blocker to two distinct questions: whether a matching authorized key/toolchain can be obtained, and whether the payload itself uses additional encryption.

## Proto ID comparison utility

Added `tools/compareMobile2Proto.js` to compare IDs from an authorized, already-exported TSV table against the current server JSON tables. It does not access PAK files, decrypt content, or import data.

Examples (run from the repository root):

```sh
node tools/compareMobile2Proto.js --kind items --source /path/to/item_proto.txt
node tools/compareMobile2Proto.js --kind mobs --source /path/to/mob_proto.txt
```

The input must be a tab-separated text file with a header row and an ID column such as `vnum`, `id`, or `race`. The report shows ID overlap, source-only/server-only IDs, duplicate IDs, and rows missing IDs. It deliberately does not automatically overwrite server data: matching IDs alone do not establish that field meanings, balancing, or asset rights are compatible.
