**Copilot** is a Nova integration with [Github Copilot Language Server](https://www.npmjs.com/package/@github/copilot-language-server?activeTab=readme)

![Example](https://raw.githubusercontent.com/besya/nova-copilot/refs/heads/main/examples/example.gif)

# Supported syntaxes

actionscript, ada, amber, apacheconfig, applescript, asciidoc, assembly, bash, batch, c, clojure, cmake, cobol, coffeescript, cpp, crystal, csharp, css, csv, d, dart, diff, dockerfile, elixir, elm, erlang, fish, fortran, gitconfig, gitignore, go, gradle, graphql, groovy, haskell, haxe, hjson, html, html+ejs, html+erb, ini, java, javascript, json, json5, julia, kotlin, latex, less, lisp, log, lua, make, makefile, markdown, matlab, mediawiki, mysql, nginxconfig, nim, objective-c, objective-cpp, ocaml, orgmode, pascal, perl, php, plaintext, plsql, postgresql, powershell, prolog, properties, protobuf, python, r, regex, restructuredtext, ruby, rust, sass, scala, scheme, scss, shellscript, smalltalk, sqlite, sql, sshconfig, strings, stylus, svelte, swift, tcl, textile, thrift, toml, tsq, tsql, tsx, typescript, vbnet, verilog, vhdl, vue, xml, yaml, zig, zsh

# Requirements

Copilot extension requires some additional tools to be installed:

- Copilot Language Server

## Install Copilot Language Server

```
npm install @github/copilot-language-server
```

### Check installation

```
$ copilot-language-server --version
1.302.0
```

## Configuration

Once Copilot Language Server is installed we need to set the correct path in extension settings

Open **Extensions > Extension Library > Copilot** then select Copilot's **Settings** tab.

In the Copilot Language Server path paste the `copilot-language-server` path.

Path can be found using `which` command

```
$ which copilot-language-server
/Users/besya/.local/share/mise/installs/node/23.11.0/bin/copilot-language-server
```

## Usage

### Sign in

1. Go to **Extensions > Copilot > Sign In**
2. Notification should appear with the code
3. Copy the code and click "Sign in with Github"
4. Switch to your browser and you should see the Github's Device Activation page
5. Click "Continue"
6. Paste the code you copied earlier
7. Click "Continue"
8. Click "Authorize Github Copilot Plugin"
9. You should see the page with "Congratulations, you're all set!" message
10. Close this page and switch back to Nova
11. Wait a few seconds and the Notification should appear with the "Authorized" message
12. Congratulations. Now you are able to use Copilot

If you have issues related to Sign In check [this steps](https://github.com/besya/nova-copilot/issues/1#issuecomment-2701344727) first:

### Completions

Default shortcut for inline completion command is `^"` (control-shift-')
The completion provided by copilot-language-server should appear next to your cursor position and autoselected.

#### Custom shortcut

Changing the default keyboard shortcut to a custom one is very easy:
1. Open Nova Settings (command+,)
2. Select "Key Bindings"
3. Enter "inline completion" in the Filter input field
4. Select the "Inline completion (Copilot)" row
5. Double-click the ^" shortcut and enter your own

#### Experimental feature

There is a another option to use inline completion and it's a completion by typing. This invocation happens on `TextEditor.onDidStopChanging`.

This mode can be enabled in **Extensions > Extension Library > Copilot > Settings** by enabling the `Enable inline completions on typing` checkbox.

**WARNING**: This is an experimental feature, so be careful not to lose or break your code by using it.
