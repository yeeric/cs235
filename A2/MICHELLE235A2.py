"""
CISC235 Assignment 2: Binary vs Trinary
Michelle Ye
20431594

I confirm that this submission is my own work and is consistent
with the Queen's regulations on Academic Integrity.
"""

def binarysearchcount(arr, target):
    """
    Performs binary search on a sorted array.
    Returns the number of comparisons made between array elements and the target.
    """
    comparisons = 0
    first = 0
    last = len(arr) - 1
    done = False
    
    while not done:
        if first > last:
            done = True
        else:
            mid = (first + last) // 2

            # Compare middle element to target
            comparisons += 1
            if arr[mid] == target:
                done = True
            else:
                # Determine which half to continue searching
                comparisons += 1
                if arr[mid] > target:
                    last = mid - 1
                else:
                    first = mid + 1
                    
    return comparisons


def trinarysearchcount(arr, target):
    """
    Performs trinary search on a sorted array.
    Returns the number of comparisons made between array elements and the target.
    """
    comparisons = 0
    first = 0
    last = len(arr) - 1
    done = False
    
    while not done:
        if first > last:
            done = True
        else:
            # Compute split points
            one_third = first + (last - first) // 3
            two_thirds = first + 2 * (last - first) // 3
            
            # Compare first split to target
            comparisons += 1
            if arr[one_third] == target:
                done = True
            else:
                comparisons += 1
                if arr[one_third] > target:
                    # Search left third
                    last = one_third - 1
                else:
                    # Compare second split to target
                    comparisons += 1
                    if arr[two_thirds] == target:
                        done = True
                    else:
                        comparisons += 1
                        if arr[two_thirds] > target:
                            # Search middle third
                            first = one_third + 1
                            last = two_thirds - 1
                        else:
                            # Search right third
                            first = two_thirds + 1
                            
    return comparisons


def run_experiments():
    """Runs Experiment 1 and  2 for all input sizes."""
    n_sizes = [1000, 2000, 4000, 8000, 16000]
    

    print('Experiment 1: Sucessful Searches')
    print("-" * 65)
    print(f"{'N':<10} | {'Binary Search Avg':<20} | {'Trinary Search Average':<20}")
    print("-" * 65)

    for n in n_sizes:
        # Sorted array of n even integers
        arr = [i * 2 for i in range(n)]
        
        bin_total = 0
        trin_total = 0
        
        # Search for each value present in the array
        for target in arr:
            bin_total += binarysearchcount(arr, target)
            trin_total += trinarysearchcount(arr, target)
            
        print(f"{n:<10} | {bin_total / n:<20.3f} | {trin_total / n:<20.3f}")


    print("\n\nExperiment 2: Unsuccessful Searches")
    print(f"{'N':<10} | {'Binary Search Avg':<20} | {'Trinary Search Average':<20}")
    print("-" * 65)

    for n in n_sizes:
        # Sorted array of n even integers
        arr = [i * 2 for i in range(n)]
       
        # Generate targets not in the array: one too small, one too large,
        # and one value that fall between consecutive array elements
        targets = [-1]
       
        gap = 1
        while gap < arr[-1]:
            targets.append(gap)
            gap += 2
        
        targets.append(arr[-1] + 1)  #total targets = n + 1
        
        bin_total = 0
        trin_total = 0
        
        for target in targets:
            bin_total += binarysearchcount(arr, target)
            trin_total += trinarysearchcount(arr, target)
            
        num_searches = len(targets)
        print(f"{n:<10} | {bin_total / num_searches:<20.3f} | {trin_total / num_searches:<20.3f}")


if __name__ == "__main__":
    run_experiments()
