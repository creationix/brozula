/* Make sure to add the luajit source tree to your require path. */
#include "src/lj_bc.h"
#include <stdio.h>

void main() {
  printf("// For mapping enum integer values to opcode names\n");
  printf("exports.opcodes = [");
  int i = 0;
#define BCENUM(name, ma, mb, mc, mt)  \
  if (i > 0) printf(", "); \
  if (i++ % 7 == 0) printf("\n  "); \
  printf("\"%s\"", #name);
BCDEF(BCENUM)
#undef BCENUM
  printf("\n];\n\n");


  printf("// For mapping opcode names to parse instructions\n");
  printf("exports.bcdef = {");
  i = 0;
#define BCENUM(name, ma, mb, mc, mt)  \
  if (i++ > 0) printf(",\n"); \
  else printf("\n"); \
  printf("  %s: {ma: \"%s\", mb: \"%s\", mc: \"%s\", mt: \"%s\"}", #name, #ma, #mb, #mc, #mt);
BCDEF(BCENUM)
#undef BCENUM
  printf("\n};\n");


/*
#define BCENUM(name, ma, mb, mc, mt)  \
  printf("%s: function (op) {\n", #name); \
  printf("  throw new Error(\"TODO: Implement %s opcode\");\n", #name); \
  printf("},\n");
BCDEF(BCENUM)
#undef BCENUM
*/

}