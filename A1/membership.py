"""
CISC 235  -  Winter 2026 - Assignment 1
Student:     Michelle Ye
Student ID:  20431594
Membership Problem: Comparing Linear Search vs Sort + Binary Search

This program compares two algorithms for the membership problem:
- Algorithm A: Linear search through an unsorted list
- Algorithm B: Sort the list once uisng merge sort algorithm with O(n log n) complexity, then use binary search for queries
"""

import random
import time


# --- Linear Search (Algorithm A) ---
# Search from beginning to end
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return True
    return False

# --- Custom Sort Implementation (Merge Sort) ---
#     Use O(n log n) complexity


def merge_sort(arr):

    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return merge(left, right)


def merge(left, right):
    """
    Merge two sorted arrays into one sorted array.
    """
    result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])
    return result


def binary_search(sorted_S, x):
    """
    Binary search on a sorted list.
    Returns True if x is in sorted_S, False otherwise.
    Time complexity: O(log n)
    """
    left = 0
    right = len(sorted_S) - 1

    while left <= right:
        mid = (left + right) // 2
        if sorted_S[mid] == x:
            return True
        elif sorted_S[mid] < x:
            left = mid + 1
        else:
            right = mid - 1

    return False


def algorithm_A(S, targets):
    """
    Algorithm A: Perform k linear searches on the unsorted list S.
    Returns the total time taken.
    """
    start_time = time.perf_counter()
    for x in targets:
        linear_search(S, x)
    end_time = time.perf_counter()
    return end_time - start_time


def algorithm_B(S, targets, presorted=None):
    """
    Algorithm B: Sort the list once, then perform k binary searches.
    Returns the total time taken (including sorting if presorted is None).
    If presorted is provided, uses that instead of sorting again.
    """
    start_time = time.perf_counter()
    if presorted is None:
        sorted_S = merge_sort(S)
    else:
        sorted_S = presorted
    for x in targets:
        binary_search(sorted_S, x)
    end_time = time.perf_counter()
    return end_time - start_time


def generate_targets(S, k):
    """
    Generate k target values: half in S, half not in S.
    """
    targets = []
    n = len(S)
    S_set = set(S)

    # Half of targets should be in S
    in_S_count = k // 2
    not_in_S_count = k - in_S_count

    # Select elements that ARE in S
    if in_S_count <= len(S):
        targets_in_S = random.sample(S, in_S_count)
    else:
        # If we need more targets than elements, allow repeats
        targets_in_S = [random.choice(S) for _ in range(in_S_count)]

    # Generate elements NOT in S
    max_val = max(S) + 1000000
    min_val = min(S) - 1000000
    targets_not_in_S = []
    attempts = 0
    while len(targets_not_in_S) < not_in_S_count and attempts < not_in_S_count * 100:
        candidate = random.randint(min_val, max_val)
        if candidate not in S_set:
            targets_not_in_S.append(candidate)
        attempts += 1

    # If we couldn't find enough unique values not in S, use large random numbers
    while len(targets_not_in_S) < not_in_S_count:
        targets_not_in_S.append(random.randint(
            max_val + 1, max_val + 10000000))

    targets = targets_in_S + targets_not_in_S
    random.shuffle(targets)
    return targets


def find_crossover_point(S, num_trials=3):
    """
    Find k* - the smallest k where Algorithm B becomes preferable to Algorithm A.
    Returns k* and the ratio k*/n.
    """
    n = len(S)

    # Pre-sort S once for Algorithm B
    sorted_S = merge_sort(S.copy())

    # Start with small k and increase it
    k = 1
    step = 1

    while k <= n * 10:  # k* may be greater than n
        time_A_total = 0
        time_B_total = 0

        for _ in range(num_trials):
            targets = generate_targets(S, k)

            # Time Algorithm A
            time_A = algorithm_A(S, targets)
            time_A_total += time_A

            # Time Algorithm B (including sort time)
            time_B = algorithm_B(S, targets)
            time_B_total += time_B

        avg_time_A = time_A_total / num_trials
        avg_time_B = time_B_total / num_trials

        if avg_time_B < avg_time_A:
            # Found crossover, but let's refine it
            # Binary search for more precise k*
            low = max(1, k - step)
            high = k

            while low < high:
                mid = (low + high) // 2

                time_A_check = 0
                time_B_check = 0

                for _ in range(num_trials):
                    targets = generate_targets(S, mid)
                    time_A_check += algorithm_A(S, targets)
                    time_B_check += algorithm_B(S, targets)

                if time_B_check / num_trials < time_A_check / num_trials:
                    high = mid
                else:
                    low = mid + 1

            return low, low / n

        # Increase step size as k grows for efficiency
        if k < 100:
            step = 10
        elif k < 1000:
            step = 50
        else:
            step = 100

        k += step

    return k, k / n


def run_experiment(n, num_trials=3):
    """
    Run detailed experiment for a given n, testing various k values.
    Returns a dictionary with timing data.
    """
    print(f"\n{'='*60}")
    print(f"Running experiment for n = {n}")
    print(f"{'='*60}")

    # Generate the set S
    S = [random.randint(1, n * 10) for _ in range(n)]

    # Find the crossover point
    k_star, ratio = find_crossover_point(S, num_trials)

    print(f"k* (crossover point) ≈ {k_star}")
    print(f"k*/n ratio ≈ {ratio:.4f}")

    # Run detailed timing for specific k values to show in report
    test_k_values = [10, 50, 100, 500, 1000, k_star]
    if k_star > 1000:
        test_k_values = [10, 100, 500, 1000, 2000, k_star]

    detailed_results = []

    print(f"\n{'k':<10} {'Alg A (s)':<15} {'Alg B (s)':<15} {'Faster':<10}")
    print("-" * 60)

    for k in sorted(set(test_k_values)):
        if k > n * 5:
            continue

        time_A_total = 0
        time_B_total = 0

        for _ in range(num_trials):
            targets = generate_targets(S, k)
            time_A_total += algorithm_A(S, targets)
            time_B_total += algorithm_B(S, targets)

        avg_A = time_A_total / num_trials
        avg_B = time_B_total / num_trials
        faster = "A" if avg_A < avg_B else "B"

        print(f"{k:<10} {avg_A:<15.6f} {avg_B:<15.6f} {faster:<10}")
        detailed_results.append((k, avg_A, avg_B))

    return {
        'n': n,
        'k_star': k_star,
        'ratio': ratio,
        'detailed': detailed_results
    }


def main():
    """
    Main function to run all experiments.
    """
    print("CISC 235 - Assignment 1: Membership Problem")
    print("Comparing Algorithm A (Linear Search) vs Algorithm B (Sort + Binary Search)")
    print("=" * 60)

    # Set random seed for reproducibility
    random.seed(42)

    # Test values of n
    n_values = [1000, 2000, 5000, 10000]
    num_trials = 3

    all_results = []

    for n in n_values:
        result = run_experiment(n, num_trials)
        all_results.append(result)

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY OF RESULTS")
    print("=" * 60)
    print(f"\n{'n':<10} {'k*':<15} {'k*/n ratio':<15}")
    print("-" * 40)

    for result in all_results:
        print(
            f"{result['n']:<10} {result['k_star']:<15} {result['ratio']:<15.4f}")

    # Analyze the trend
    ratios = [r['ratio'] for r in all_results]

    print("\n" + "=" * 60)
    print("ANALYSIS")
    print("=" * 60)

    # Check if ratio is increasing, decreasing, or constant
    if all(ratios[i] < ratios[i+1] for i in range(len(ratios)-1)):
        trend = "INCREASING"
    elif all(ratios[i] > ratios[i+1] for i in range(len(ratios)-1)):
        trend = "DECREASING"
    else:
        avg_ratio = sum(ratios) / len(ratios)
        variance = sum((r - avg_ratio)**2 for r in ratios) / len(ratios)
        if variance < 0.01:  # relatively small variance
            trend = "RELATIVELY CONSTANT"
        else:
            trend = "VARIABLE (no clear trend)"

    print(f"\nAs n increases, the k*/n ratio appears to be: {trend}")

    return all_results


if __name__ == "__main__":
    results = main()
