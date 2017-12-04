#define _CRT_SECURE_NO_WARNINGS    // 보안 경고로 인한 컴파일 에러 방지
#include <stdio.h>

int main() {
int x;

printf("Enter x : ");
fflush(stdout);
scanf("%d", &x);



printf("Value entered x is %d\n", x);
  return 0;
}